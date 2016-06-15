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
import { Link } from 'react-router';
import { translateWithParameters } from '../../../helpers/l10n';

export default class ProfileInheritanceBox extends React.Component {
  static propTypes = {
    profile: React.PropTypes.shape({
      key: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      activeRuleCount: React.PropTypes.number.isRequired,
      overridingRuleCount: React.PropTypes.number
    }).isRequired,
    className: React.PropTypes.string
  };

  render () {
    const { profile, className } = this.props;

    return (
        <div className={className}>
          <h6>
            <Link to={{ pathname: '/show', query: { key: profile.key } }}>
              {profile.name}
            </Link>
          </h6>

          <p className="note">
            {translateWithParameters(
                'quality_profile.x_active_rules',
                profile.activeRuleCount
            )}
          </p>

          {profile.overridingRuleCount != null && (
              <p className="note">
                {translateWithParameters(
                    'quality_profiles.x_overridden_rules',
                    profile.overridingRuleCount
                )}
              </p>
          )}
        </div>
    );
  }
}
