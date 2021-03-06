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
package org.sonarsource.sonarqube.perf.scanner;

import com.google.common.collect.Lists;
import org.sonarsource.sonarqube.perf.MavenLogs;
import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;

public class MavenLogsTest {
  @Test
  public void testExtractTotalTime() throws Exception {
    assertThat(MavenLogs.extractTotalTime(" \n  Total time: 6.015s \n ")).isEqualTo(6015);
    assertThat(MavenLogs.extractTotalTime(" \n  Total time: 3:14.025s\n  ")).isEqualTo(194025);
  }

  @Test
  public void testMaxMemory() throws Exception {
    assertThat(MavenLogs.extractMaxMemory("  Final Memory: 68M/190M  ")).isEqualTo(190);
  }

  @Test
  public void testEndMemory() throws Exception {
    assertThat(MavenLogs.extractEndMemory("  Final Memory: 68M/190M  ")).isEqualTo(68);
  }

  @Test
  public void logs_with_different_computations_take_the_last_one() throws Exception {
    assertThat(MavenLogs.extractComputationTotalTime(Lists.newArrayList(
      "2015.09.29 16:57:45 INFO  web[o.s.s.c.q.CeWorkerRunnableImpl] Executed task | project=com.github.kevinsawicki:http-request-parent | id=AVAZm9oHIXrp54OmOeQe | time=2283ms",
      "2015.09.29 16:57:45 INFO  web[o.s.s.c.q.CeWorkerRunnableImpl] Executed task | project=com.github.kevinsawicki:http-request-parent | id=AVAZm9oHIXrp54OmOeQe | time=1234ms")))
      .isEqualTo(1234L);
  }
}
