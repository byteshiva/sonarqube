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
/**
 * Generate URL for a component's home page
 * @param {string} componentKey
 * @returns {string}
 */
export function getComponentUrl (componentKey) {
  return window.baseUrl + '/dashboard?id=' + encodeURIComponent(componentKey);
}

/**
 * Generate URL for a component's issues page
 * @param {string} componentKey
 * @param {object} query
 * @returns {string}
 */
export function getComponentIssuesUrl (componentKey, query) {
  const serializedQuery = Object.keys(query).map(criterion => (
      `${encodeURIComponent(criterion)}=${encodeURIComponent(query[criterion])}`
  )).join('|');
  return window.baseUrl + '/component_issues?id=' + encodeURIComponent(componentKey) + '#' + serializedQuery;
}

/**
 * Generate URL for a component's drilldown page
 * @param {string} componentKey
 * @param {string} metric
 * @returns {string}
 */
export function getComponentDrilldownUrl (componentKey, metric) {
  return `${window.baseUrl}/component_measures/metric/${metric}?id=${encodeURIComponent(componentKey)}`;
}

/**
 * Generate URL for a component's dashboard
 * @param {string} componentKey
 * @param {string} dashboardKey
 * @param {string} [period]
 * @returns {string}
 */
export function getComponentDashboardUrl (componentKey, dashboardKey, period) {
  let url = window.baseUrl + '/dashboard?id=' + encodeURIComponent(componentKey) +
      '&did=' + encodeURIComponent(dashboardKey);
  if (period) {
    url += '&period=' + period;
  }
  return url;
}

/**
 * Generate URL for a fixed component's dashboard (overview)
 * @param {string} componentKey
 * @param {string} dashboardKey
 * @returns {string}
 */
export function getComponentFixedDashboardUrl (componentKey, dashboardKey) {
  return window.baseUrl + '/overview' + dashboardKey + '?id=' + encodeURIComponent(componentKey);
}

/**
 * Generate URL for a component's dashboards management page
 * @param {string} componentKey
 * @returns {string}
 */
export function getComponentDashboardManagementUrl (componentKey) {
  return window.baseUrl + '/dashboards?resource=' + encodeURIComponent(componentKey);
}

/**
 * Generate URL for a quality profile
 * @param {string} key
 * @returns {string}
 */
export function getQualityProfileUrl (key) {
  return window.baseUrl + '/profiles/show?key=' + encodeURIComponent(key);
}

/**
 * Generate URL for a quality gate
 * @param {string} key
 * @returns {string}
 */
export function getQualityGateUrl (key) {
  return window.baseUrl + '/quality_gates/show/' + encodeURIComponent(key);
}

/**
 * Generate URL for the rules page
 * @param {object} query
 * @returns {string}
 */
export function getRulesUrl (query) {
  if (query) {
    const serializedQuery = Object.keys(query).map(criterion => (
        `${encodeURIComponent(criterion)}=${encodeURIComponent(
            query[criterion])}`
    )).join('|');
    return window.baseUrl + '/coding_rules#' + serializedQuery;
  }
  return window.baseUrl + '/coding_rules';
}
