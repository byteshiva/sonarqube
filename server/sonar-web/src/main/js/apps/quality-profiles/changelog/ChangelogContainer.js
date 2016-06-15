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
import Changelog from './Changelog';
import ChangelogSearch from './ChangelogSearch';
import ChangelogEmpty from './ChangelogEmpty';
import { getProfileChangelog } from '../../../api/quality-profiles';

export default class ChangelogContainer extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object
  };

  state = {
    loading: true
  };

  componentWillMount () {
    this.handleFromDateChange = this.handleFromDateChange.bind(this);
    this.handleToDateChange = this.handleToDateChange.bind(this);
  }

  componentDidMount () {
    this.mounted = true;
    this.loadChangelog();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.location !== this.props.location) {
      this.loadChangelog();
    }
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  loadChangelog () {
    this.setState({ loading: true });
    const { query } = this.props.location;
    const data = { profileKey: this.props.profile.key };
    if (query.since) {
      data.since = query.since;
    }
    if (query.to) {
      data.to = query.to;
    }

    getProfileChangelog(data).then(r => {
      if (this.mounted) {
        this.setState({
          events: r.events,
          total: r.total,
          page: r.p,
          loading: false
        });
      }
    });
  }

  handleFromDateChange (fromDate) {
    const query = { ...this.props.location.query, since: fromDate };
    this.context.router.push({
      pathname: '/changelog',
      query
    });
  }

  handleToDateChange (toDate) {
    const query = { ...this.props.location.query, to: toDate };
    this.context.router.push({
      pathname: '/changelog',
      query
    });
  }

  render () {
    const { query } = this.props.location;

    // TODO inline styles
    return (
        <div
            className="js-profile-changelog"
            style={{ padding: '15px 20px', border: '1px solid #e6e6e6', borderRadius: '3px', backgroundColor: '#fff' }}>

          <header className="spacer-bottom">
            <ChangelogSearch
                fromDate={query.since}
                toDate={query.to}
                onFromDateChange={this.handleFromDateChange}
                onToDateChange={this.handleToDateChange}/>

            {this.state.loading && (
                <i className="spinner spacer-left"/>
            )}
          </header>

          {this.state.events != null && this.state.events.length === 0 && (
              <ChangelogEmpty/>
          )}

          {this.state.events != null && this.state.events.length > 0 && (
              <Changelog events={this.state.events}/>
          )}
        </div>
    );
  }
}
