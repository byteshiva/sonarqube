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
import { Link, IndexLink } from 'react-router';
import RenameProfileView from '../views/RenameProfileView';
import CopyProfileView from '../views/CopyProfileView';
import DeleteProfileView from '../views/DeleteProfileView';
import { ProfileType } from '../propTypes';
import { translate } from '../../../helpers/l10n';
import { setDefaultProfile } from '../../../api/quality-profiles';

export default class ProfileHeader extends React.Component {
  static propTypes = {
    profile: ProfileType.isRequired,
    canAdmin: React.PropTypes.bool.isRequired,
    updateProfiles: React.PropTypes.func.isRequired
  };

  static contextTypes = {
    router: React.PropTypes.object
  };

  handleRenameClick (e) {
    e.preventDefault();
    new RenameProfileView({
      profile: this.props.profile
    }).on('done', () => {
      this.props.updateProfiles();
    }).render();
  }

  handleCopyClick (e) {
    e.preventDefault();
    new CopyProfileView({
      profile: this.props.profile
    }).on('done', profile => {
      this.props.updateProfiles().then(() => {
        this.context.router.push({
          pathname: '/show',
          query: { key: profile.key }
        });
      });
    }).render();
  }

  handleSetDefaultClick (e) {
    e.preventDefault();
    setDefaultProfile(this.props.profile.key)
        .then(this.props.updateProfiles);
  }

  handleDeleteClick (e) {
    // TODO DeleteProfileView should now about profile's children

    e.preventDefault();
    new DeleteProfileView({
      profile: this.props.profile
    }).on('done', () => {
      this.context.router.replace('/');
      this.props.updateProfiles();
    }).render();
  }

  render () {
    const { profile, canAdmin } = this.props;

    const backupUrl = window.baseUrl +
        '/api/qualityprofiles/backup?profileKey=' +
        encodeURIComponent(profile.key);

    // TODO fix inline styles

    return (
        <header className="page-header quality-profile-header">
          <div className="note spacer-bottom">
            <IndexLink to="/" className="text-muted">
              {translate('quality_profiles.page')}
            </IndexLink>
          </div>

          <h1 className="page-title">
            <Link
                to={{ pathname: '/show', query: { key: this.props.profile.key } }}
                className="link-base-color">
              {profile.name}
            </Link>
          </h1>

          <div className="pull-right">
            <ul className="list-inline" style={{ lineHeight: '24px' }}>
              <li>
                <Link
                    to={{ pathname: '/changelog', query: { key: this.props.profile.key } }}
                    className="small text-muted"
                    activeClassName="link-active">
                  Changelog
                </Link>
              </li>
              <li>
                <div className="pull-left dropdown">
                  <button className="dropdown-toggle"
                          data-toggle="dropdown">
                    {translate('actions')}
                    {' '}
                    <i className="icon-dropdown"/>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-right">
                    <li>
                      <Link
                          to={{ pathname: '/compare', query: { key: profile.key } }}
                          id="quality-profile-compare">
                        {translate('compare')}
                      </Link>
                    </li>
                    <li>
                      <a id="quality-profile-backup" href={backupUrl}>
                        {translate('backup_verb')}
                      </a>
                    </li>
                    {canAdmin && (
                        <li>
                          <a id="quality-profile-rename"
                             href="#"
                             onClick={this.handleRenameClick.bind(this)}>
                            {translate('rename')}
                          </a>
                        </li>
                    )}
                    {canAdmin && (
                        <li>
                          <a
                              id="quality-profile-copy"
                              href="#"
                              onClick={this.handleCopyClick.bind(this)}>
                            {translate('copy')}
                          </a>
                        </li>
                    )}
                    {canAdmin && !profile.isDefault && (
                        <li>
                          <a id="quality-profile-set-as-default"
                             href="#"
                             onClick={this.handleSetDefaultClick.bind(this)}>
                            {translate('set_as_default')}
                          </a>
                        </li>
                    )}
                    {canAdmin && !profile.isDefault && (
                        <li>
                          <a id="quality-profile-delete"
                             href="#"
                             onClick={this.handleDeleteClick.bind(this)}>
                            {translate('delete')}
                          </a>
                        </li>
                    )}
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </header>
    );
  }
}
