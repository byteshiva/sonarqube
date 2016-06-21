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

import static com.google.common.base.Preconditions.checkArgument;
import static java.util.Locale.ENGLISH;
import static org.elasticsearch.common.Strings.isNullOrEmpty;

import com.google.common.base.Charsets;
import com.google.common.base.Splitter;
import com.google.common.collect.Iterables;
import java.util.Base64;
import java.util.Optional;
import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.elasticsearch.common.Strings;
import org.sonar.db.DbClient;
import org.sonar.db.DbSession;
import org.sonar.db.user.UserDto;
import org.sonar.server.exceptions.UnauthorizedException;
import org.sonar.server.user.ServerUserSession;
import org.sonar.server.user.ThreadLocalUserSession;
import org.sonar.server.usertoken.UserTokenAuthenticator;

public class BasicAuthenticator {

  private static final Base64.Decoder BASE64_DECODER = Base64.getDecoder();
  private static final Splitter CREDENTIALS_SPLITTER = Splitter.on(":");

  private static final String AUTHORIZATION_HEADER = "Authorization";
  private static final String BASIC_AUTHORIZATION = "BASIC";

  private final DbClient dbClient;
  private final ThreadLocalUserSession threadLocalUserSession;
  private final UserTokenAuthenticator userTokenAuthenticator;

  public BasicAuthenticator(DbClient dbClient, ThreadLocalUserSession threadLocalUserSession, UserTokenAuthenticator userTokenAuthenticator) {
    this.dbClient = dbClient;
    this.threadLocalUserSession = threadLocalUserSession;
    this.userTokenAuthenticator = userTokenAuthenticator;
  }

  public void authenticate(HttpServletRequest request, HttpServletResponse response) {
    String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);
    if (authorizationHeader == null || !authorizationHeader.toUpperCase(ENGLISH).startsWith(BASIC_AUTHORIZATION)) {
      return;
    }

    String[] credentials = getCredentials(authorizationHeader);
    String login = credentials[0];
    String password = credentials[1];
    if (isNullOrEmpty(login)) {
      throw new UnauthorizedException();
    }

    authenticate(login, password, request, response);
  }

  private static String[] getCredentials(String authorizationHeader) {
    String basicAuthEncoded = authorizationHeader.substring(6);
    String basicAuthDecoded = new String(BASE64_DECODER.decode(basicAuthEncoded.getBytes(Charsets.UTF_8)), Charsets.UTF_8);
    String[] credentials = Iterables.toArray(CREDENTIALS_SPLITTER.split(basicAuthDecoded), String.class);
    checkArgument(credentials.length == 2, "Login and password must");
    return credentials;
  }

  private void authenticate(String login, @Nullable String password, HttpServletRequest request, HttpServletResponse response) {
    if (Strings.isNullOrEmpty(password)) {
      authenticateFromUserToken(login);
    } else {
      // TODO Do not generate cookies but only set the UserSession
//      credentialsAuthenticator.authenticate(login, password, request, response);
    }
  }

  private void authenticateFromUserToken(String token){
    Optional<String> authenticatedLogin = userTokenAuthenticator.authenticate(token);
    if (!authenticatedLogin.isPresent()) {
      return;
    }
    DbSession dbSession = dbClient.openSession(false);
    try {
      UserDto userDto = dbClient.userDao().selectActiveUserByLogin(dbSession, authenticatedLogin.get());
      if (userDto != null) {
        threadLocalUserSession.set(ServerUserSession.createForUser(dbClient, userDto));
      }
    } finally {
      dbClient.closeSession(dbSession);
    }
  }

}
