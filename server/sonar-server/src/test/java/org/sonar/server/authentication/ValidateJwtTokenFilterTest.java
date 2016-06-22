/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

package org.sonar.server.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.sonar.db.user.UserTesting.newUserDto;

import java.util.Optional;
import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.config.Settings;
import org.sonar.api.utils.System2;
import org.sonar.db.DbClient;
import org.sonar.db.DbSession;
import org.sonar.db.DbTester;
import org.sonar.db.user.UserDto;
import org.sonar.server.exceptions.UnauthorizedException;
import org.sonar.server.user.ServerUserSession;
import org.sonar.server.user.ThreadLocalUserSession;

public class ValidateJwtTokenFilterTest {

  @Rule
  public DbTester dbTester = DbTester.create(System2.INSTANCE);

  DbClient dbClient = dbTester.getDbClient();

  DbSession dbSession = dbTester.getSession();

  ThreadLocalUserSession userSession = mock(ThreadLocalUserSession.class);

  HttpServletRequest request = mock(HttpServletRequest.class);
  HttpServletResponse response = mock(HttpServletResponse.class);
  FilterChain chain = mock(FilterChain.class);

  JwtHttpHandler jwtHttpHandler = mock(JwtHttpHandler.class);
  BasicAuthenticator basicAuthenticator = mock(BasicAuthenticator.class);

  Settings settings = new Settings();

  UserDto user = newUserDto();

  ValidateJwtTokenFilter underTest = new ValidateJwtTokenFilter(dbClient, settings, jwtHttpHandler, basicAuthenticator, userSession);

  @Before
  public void setUp() throws Exception {
    dbClient.userDao().insert(dbSession, user);
    dbSession.commit();
  }

  @Test
  public void do_get_pattern() throws Exception {
    assertThat(underTest.doGetPattern().matches("/")).isTrue();
    assertThat(underTest.doGetPattern().matches("/foo")).isTrue();

    assertThat(underTest.doGetPattern().matches("/api/authentication/login")).isFalse();

    // exclude static resources
    assertThat(underTest.doGetPattern().matches("/css/style.css")).isFalse();
    assertThat(underTest.doGetPattern().matches("/fonts/font.ttf")).isFalse();
    assertThat(underTest.doGetPattern().matches("/images/logo.png")).isFalse();
    assertThat(underTest.doGetPattern().matches("/js/jquery.js")).isFalse();
  }

  @Test
  public void validate_session_from_token() throws Exception {
    when(userSession.isLoggedIn()).thenReturn(true);
    underTest.doFilter(request, response, chain);

    verify(jwtHttpHandler).validateToken(request, response);
    verify(response, never()).setStatus(anyInt());
    verify(chain).doFilter(request, response);
  }

  @Test
  public void validate_session_from_basic_authentication() throws Exception {
    when(userSession.isLoggedIn()).thenReturn(false).thenReturn(true);
    when(basicAuthenticator.authenticate(request)).thenReturn(Optional.of(user));
    underTest.doFilter(request, response, chain);

    verify(jwtHttpHandler).validateToken(request, response);
    verify(basicAuthenticator).authenticate(request);
    verify(userSession).set(any(ServerUserSession.class));
    verify(response, never()).setStatus(anyInt());
    verify(chain).doFilter(request, response);
  }

  @Test
  public void return_code_401_when_invalid_token_exception() throws Exception {
    doThrow(new UnauthorizedException("invalid token")).when(jwtHttpHandler).validateToken(request, response);

    underTest.doFilter(request, response, chain);

    verify(response).setStatus(401);
    verify(chain).doFilter(request, response);
  }

  @Test
  public void return_code_401_when_not_authenticated_and_with_force_authentication() throws Exception {
    when(userSession.isLoggedIn()).thenReturn(false);
    when(basicAuthenticator.authenticate(request)).thenReturn(Optional.empty());
    settings.setProperty("sonar.forceAuthentication", true);

    underTest.doFilter(request, response, chain);

    verify(response).setStatus(401);
    verify(chain).doFilter(request, response);
  }
}
