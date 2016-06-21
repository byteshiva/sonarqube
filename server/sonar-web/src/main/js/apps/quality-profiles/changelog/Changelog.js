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
import React from 'react';
import moment from 'moment';
import SeverityHelper from '../../../components/shared/severity-helper';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { getRulesUrl } from '../../../helpers/urls';

export default class Changelog extends React.Component {
  static propTypes = {
    events: React.PropTypes.array.isRequired
  };

  render () {
    const rows = this.props.events.map((event, index) => (
        <tr key={index} className="js-profile-changelog-event">
          <td className="thin nowrap">
            {moment(event.date).format('LLL')}
          </td>
          <td className="thin nowrap">
            {event.authorName ? (
                <span>{event.authorName}</span>
            ) : (
                <span className="note">System</span>
            )}
          </td>
          <td className="thin nowrap">
            {translate('quality_profiles.changelog', event.action)}
          </td>
          <td style={{ lineHeight: '1.5' }}>
            <a href={getRulesUrl({ 'rule_key': event.ruleKey })}>
              {event.ruleName}
            </a>
          </td>
          <td className="thin nowrap">
            <ul>
              {Object.keys(event.params).map(key => (
                  <li key={key}>
                    {key === 'severity' ? (
                        <div>
                          {translate('quality_profiles.severity_set_to')}
                          {' '}
                          <SeverityHelper severity={event.params[key]}/>
                        </div>
                    ) : (
                        <div>
                          {event.params[key] ? (
                              <div>
                                {translateWithParameters(
                                    'quality_profiles.parameter_set_to',
                                    key,
                                    event.params[key]
                                )}
                              </div>
                          ) : (
                              <div>
                                {translateWithParameters(
                                    'quality_profiles.changelog.parameter_reset_to_default_value',
                                    key
                                )}
                              </div>
                          )}
                        </div>
                    )}
                  </li>
              ))}
            </ul>
          </td>
        </tr>
    ));

    return (
        <table className="data zebra zebra-hover">
          <thead>
            <tr>
              <th className="thin nowrap">
                {translate('date')}
                {' '}
                <i className="icon-sort-desc"/>
              </th>
              <th className="thin nowrap">{translate('user')}</th>
              <th className="thin nowrap">{translate('action')}</th>
              <th>{translate('rule')}</th>
              <th className="thin nowrap">{translate('parameters')}</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
    );
  }
}
