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

import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.junit.rules.ExpectedException.none;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.sonar.api.utils.System2;
import org.sonar.db.DbClient;
import org.sonar.db.DbSession;
import org.sonar.db.DbTester;
import org.sonar.db.user.UserDto;
import org.sonar.db.user.UserTesting;
import org.sonar.server.exceptions.UnauthorizedException;
import org.sonar.server.usertoken.UserTokenAuthenticator;

public class BasicAuthenticatorTest {

  static final String LOGIN = "login";
  static final String PASSWORD = "password";

  static final UserDto USER = UserTesting.newUserDto().setLogin(LOGIN);

  @Rule
  public ExpectedException expectedException = none();

  @Rule
  public DbTester dbTester = DbTester.create(System2.INSTANCE);

  DbClient dbClient = dbTester.getDbClient();

  DbSession dbSession = dbTester.getSession();

  CredentialsAuthenticator credentialsAuthenticator = mock(CredentialsAuthenticator.class);
  UserTokenAuthenticator userTokenAuthenticator = mock(UserTokenAuthenticator.class);

  HttpServletRequest request = mock(HttpServletRequest.class);
  HttpServletResponse response = mock(HttpServletResponse.class);

  BasicAuthenticator underTest = new BasicAuthenticator(dbClient, credentialsAuthenticator, userTokenAuthenticator);

  @Test
  public void authenticate_from_basic_http_header() throws Exception {
    when(request.getHeader("Authorization")).thenReturn("Basic bG9naW46cGFzc3dvcmQ=");
    when(credentialsAuthenticator.authenticate(LOGIN, PASSWORD, request)).thenReturn(USER);

    underTest.authenticate(request);

    verify(credentialsAuthenticator).authenticate("login", "password", request);
  }

  @Test
  public void does_not_authenticate_when_no_authorization_header() throws Exception {
    underTest.authenticate(request);

    verifyZeroInteractions(credentialsAuthenticator);
  }

  @Test
  public void does_not_authenticate_when_authorization_header_is_not_BASIC() throws Exception {
    when(request.getHeader("Authorization")).thenReturn("OTHER bG9naW46cGFzc3dvcmQ=");

    underTest.authenticate(request);

    verifyZeroInteractions(credentialsAuthenticator);
  }

  @Test
  public void fail_to_authenticate_when_no_login() throws Exception {
    when(request.getHeader("Authorization")).thenReturn("Basic OnBhc3N3b3Jk");

    expectedException.expect(UnauthorizedException.class);
    underTest.authenticate(request);
  }

  @Test
  public void authenticate_from_user_token() throws Exception {
    insertUser(UserTesting.newUserDto().setLogin(LOGIN));
    when(userTokenAuthenticator.authenticate("token")).thenReturn(Optional.of(LOGIN));
    when(request.getHeader("Authorization")).thenReturn("Basic dG9rZW46");

    Optional<UserDto> userDto = underTest.authenticate(request);

    assertThat(userDto.isPresent()).isTrue();
    assertThat(userDto.get().getLogin()).isEqualTo(LOGIN);
  }

  @Test
  public void does_not_authenticate_from_user_token_when_token_is_invalid() throws Exception {
    insertUser(UserTesting.newUserDto().setLogin(LOGIN));
    when(userTokenAuthenticator.authenticate("token")).thenReturn(Optional.empty());
    when(request.getHeader("Authorization")).thenReturn("Basic dG9rZW46");

    expectedException.expect(UnauthorizedException.class);
    underTest.authenticate(request);
  }

  @Test
  public void does_not_authenticate_from_user_token_when_token_does_not_match_active_user() throws Exception {
    insertUser(UserTesting.newUserDto().setLogin(LOGIN));
    when(userTokenAuthenticator.authenticate("token")).thenReturn(Optional.of("Unknown user"));
    when(request.getHeader("Authorization")).thenReturn("Basic dG9rZW46");

    expectedException.expect(UnauthorizedException.class);
    underTest.authenticate(request);
  }

  private UserDto insertUser(UserDto userDto){
    dbClient.userDao().insert(dbSession, userDto);
    dbSession.commit();
    return userDto;
  }

}
