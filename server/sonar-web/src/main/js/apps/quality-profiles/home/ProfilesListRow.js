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
import shallowCompare from 'react-addons-shallow-compare';
import { ProfileType } from '../propTypes';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { getRulesUrl } from '../../../helpers/urls';

export default class ProfilesListRow extends React.Component {
  static propTypes = {
    profile: ProfileType.isRequired
  };

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  renderName () {
    const { profile } = this.props;
    return (
        <h4>
          <Link to={{ pathname: '/show', query: { key: profile.key } }}>
            {profile.name}
          </Link>
        </h4>
    );
  }

  renderInheritance () {
    const { profile } = this.props;

    if (!profile.isInherited) {
      return null;
    }

    return (
        <div className="note">
          <i className="icon-inheritance"/>
          {' '}
          <Link className="text-muted"
                to={{ pathname: '/show', query: { key: profile.parentKey } }}>
            {profile.parentName}
          </Link>
        </div>
    );
  }

  renderProjects () {
    const { profile } = this.props;

    if (profile.isDefault) {
      return (
          <span className="badge">
            {translate('default')}
          </span>
      );
    }

    return (
        <span>
          {translateWithParameters(
              'quality_profiles.x_projects',
              profile.projectCount)}
        </span>
    );
  }

  renderRules () {
    const { profile } = this.props;

    const activeRulesUrl = getRulesUrl({
      qprofile: profile.key,
      activation: 'true'
    });

    return (
        <div>
          <a href={activeRulesUrl}>
            {profile.activeRuleCount}
          </a>
          {' '}
          {translate('coding_rules._rules')}
        </div>
    );
  }

  render () {
    return (
        <tr className="quality-profiles-table-row"
            data-key={this.props.profile.key}
            data-name={this.props.profile.name}>
          <td className="quality-profiles-table-name">
            {this.renderName()}
          </td>
          <td className="quality-profiles-table-inheritance">
            {this.renderInheritance()}
          </td>
          <td className="quality-profiles-table-projects text-right">
            {this.renderProjects()}
          </td>
          <td className="quality-profiles-table-rules text-right">
            {this.renderRules()}
          </td>
        </tr>
    );
  }
}
