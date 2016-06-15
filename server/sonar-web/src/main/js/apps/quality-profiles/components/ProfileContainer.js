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
import ProfileNotFound from './ProfileNotFound';
import ProfileHeader from '../details/ProfileHeader';

export default class ProfileContainer extends React.Component {
  componentWillMount () {
    document.querySelector('html').classList.add('dashboard-page');
  }

  componentWillUnmount () {
    document.querySelector('html').classList.remove('dashboard-page');
  }

  render () {
    const { profiles, location, ...other } = this.props;
    const { key } = location.query;
    const profile = profiles.find(profile => profile.key === key);

    if (!profile) {
      return <ProfileNotFound/>;
    }

    const child = React.cloneElement(
        this.props.children,
        { profile, profiles, ...other });

    return (
        <div>
          <ProfileHeader
              profile={profile}
              canAdmin={this.props.canAdmin}
              updateProfiles={this.props.updateProfiles}/>
          {child}
        </div>
    );
  }
}
