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

import static java.net.HttpURLConnection.HTTP_UNAUTHORIZED;
import static org.sonar.api.CoreProperties.CORE_FORCE_AUTHENTICATION_PROPERTY;
import static org.sonar.api.web.ServletFilter.UrlPattern.Builder.staticResourcePatterns;
import static org.sonar.server.authentication.AuthLoginAction.AUTH_LOGIN_URL;

import java.io.IOException;
import java.util.Optional;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.sonar.api.config.Settings;
import org.sonar.api.server.ServerSide;
import org.sonar.api.web.ServletFilter;
import org.sonar.db.DbClient;
import org.sonar.db.user.UserDto;
import org.sonar.server.exceptions.UnauthorizedException;
import org.sonar.server.user.ServerUserSession;
import org.sonar.server.user.ThreadLocalUserSession;

@ServerSide
public class ValidateJwtTokenFilter extends ServletFilter {

  private final DbClient dbClient;
  private final Settings settings;
  private final JwtHttpHandler jwtHttpHandler;
  private final BasicAuthenticator basicAuthenticator;
  private final ThreadLocalUserSession userSession;

  public ValidateJwtTokenFilter(DbClient dbClient, Settings settings, JwtHttpHandler jwtHttpHandler, BasicAuthenticator basicAuthenticator,
    ThreadLocalUserSession userSession) {
    this.dbClient = dbClient;
    this.settings = settings;
    this.jwtHttpHandler = jwtHttpHandler;
    this.basicAuthenticator = basicAuthenticator;
    this.userSession = userSession;
  }

  @Override
  public UrlPattern doGetPattern() {
    return UrlPattern.builder()
      .includes("/*")
      .excludes(staticResourcePatterns())
      .excludes(AUTH_LOGIN_URL)
      .build();
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
    HttpServletRequest request = (HttpServletRequest) servletRequest;
    HttpServletResponse response = (HttpServletResponse) servletResponse;

    try {
      authenticate(request, response);
      if (!userSession.isLoggedIn() && settings.getBoolean(CORE_FORCE_AUTHENTICATION_PROPERTY)) {
        throw new UnauthorizedException("User must be authenticated");
      }
    } catch (UnauthorizedException e) {
      jwtHttpHandler.removeToken(response);
      response.setStatus(HTTP_UNAUTHORIZED);
    } finally {
      chain.doFilter(request, response);
    }
  }

  // Try first to authenticate from JWT token, then try from basic http header
  private void authenticate(HttpServletRequest request, HttpServletResponse response) {
    jwtHttpHandler.validateToken(request, response);
    if (userSession.isLoggedIn()) {
      return;
    }
    Optional<UserDto> userDto = basicAuthenticator.authenticate(request);
    if (!userDto.isPresent()) {
      return;
    }
    userSession.set(ServerUserSession.createForUser(dbClient, userDto.get()));
  }

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    // Nothing to do
  }

  @Override
  public void destroy() {
    // Nothing to do
  }
}
