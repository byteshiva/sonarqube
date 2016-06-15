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
import ProfileInheritanceBox from './ProfileInheritanceBox';
import ChangeParentView from '../views/ChangeParentView';
import { ProfileType } from '../propTypes';
import { translate } from '../../../helpers/l10n';
import { getProfileInheritance } from '../../../api/quality-profiles';

export default class ProfileInheritance extends React.Component {
  static propTypes = {
    profile: ProfileType.isRequired,
    canAdmin: React.PropTypes.bool.isRequired
  };

  state = {
    loading: true
  };

  componentWillMount () {
    this.handleChangeParent = this.handleChangeParent.bind(this);
  }

  componentDidMount () {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.profile !== this.props.profile) {
      this.loadData();
    }
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  loadData () {
    getProfileInheritance(this.props.profile.key).then(r => {
      if (this.mounted) {
        const { ancestors, children } = r;
        this.setState({
          children,
          ancestors: ancestors.reverse(),
          profile: r.profile,
          loading: false
        });
      }
    });
  }

  handleChangeParent (e) {
    e.preventDefault();
    new ChangeParentView({
      profile: this.props.profile,
      profiles: this.props.profiles
    }).on('done', () => {
      this.props.updateProfiles();
    }).render();
  }

  render () {
    return (
        <div className="quality-profile-inheritance">
          <header className="big-spacer-bottom clearfix">
            <h2 className="pull-left">
              {translate('quality_profiles.profile_inheritance')}
            </h2>
            {this.props.canAdmin && (
                <button
                    className="pull-right js-change-parent"
                    onClick={this.handleChangeParent}>
                  {translate('quality_profiles.change_parent')}
                </button>
            )}
          </header>

          {!this.state.loading && (
              <div className="text-center">
                {this.state.ancestors.length > 0 && (
                    <ul id="quality-profile-ancestors">
                      {this.state.ancestors.map(ancestor => (
                          <li key={ancestor.key}>
                            <ProfileInheritanceBox
                                profile={ancestor}
                                className="alert alert-inline alert-info"/>
                            <div className="spacer-top spacer-bottom">
                              <i className="icon-move-down"></i>
                            </div>
                          </li>
                      ))}
                    </ul>
                )}

                <div id="quality-profile-inheritance-current">
                  <ProfileInheritanceBox
                      profile={this.state.profile}
                      className="alert alert-inline alert-success"/>
                </div>

                {this.state.children.length > 0 && (
                    <div>
                      <ul id="quality-profile-children" className="list-inline">
                        {this.state.children.map(child => (
                            <li key={child.key}>
                              <div className="spacer-top spacer-bottom">
                                <i className="icon-move-down"></i>
                              </div>
                              <ProfileInheritanceBox
                                  profile={child}
                                  className="alert alert-inline alert-info"/>
                            </li>
                        ))}
                      </ul>
                    </div>
                )}
              </div>
          )}
        </div>
    );
  }
}
