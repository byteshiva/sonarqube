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
import ComparisonEmpty from './ComparisonEmpty';
import SeverityIcon from '../../../components/shared/severity-icon';
import { translateWithParameters } from '../../../helpers/l10n';
import { getRulesUrl } from '../../../helpers/urls';

export default class ComparisonResults extends React.Component {
  static propTypes = {
    left: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired
    }).isRequired,
    right: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired
    }).isRequired,
    inLeft: React.PropTypes.array.isRequired,
    inRight: React.PropTypes.array.isRequired,
    modified: React.PropTypes.array.isRequired
  };

  renderLeft () {
    if (this.props.inLeft.length === 0) {
      return null;
    }
    const header = (
        <tr key="left-header">
          <td>
            <h6>
              {translateWithParameters(
                  'quality_profiles.x_rules_only_in',
                  this.props.inLeft.length
              )}
              {' '}
              {this.props.left.name}
            </h6>
          </td>
          <td>&nbsp;</td>
        </tr>
    );
    const rows = this.props.inLeft.map(rule => (
        <tr key={`left-${rule.key}`}
            className="js-comparison-in-left">
          <td>
            <SeverityIcon severity={rule.severity}/>
            {' '}
            <a href={getRulesUrl({ 'rule_key': rule.key })}>
              {rule.name}
            </a>
          </td>
          <td>&nbsp;</td>
        </tr>
    ));
    return [header, ...rows];
  }

  renderRight () {
    if (this.props.inRight.length === 0) {
      return null;
    }
    const header = (
        <tr key="right-header">
          <td>&nbsp;</td>
          <td>
            <h6>
              {translateWithParameters(
                  'quality_profiles.x_rules_only_in',
                  this.props.inRight.length
              )}
              {' '}
              {this.props.right.name}
            </h6>
          </td>
        </tr>
    );
    const rows = this.props.inRight.map(rule => (
        <tr key={`right-${rule.key}`}
            className="js-comparison-in-right">
          <td>&nbsp;</td>
          <td>
            <SeverityIcon severity={rule.severity}/>
            {' '}
            <a href={getRulesUrl({ 'rule_key': rule.key })}>
              {rule.name}
            </a>
          </td>
        </tr>
    ));
    return [header, ...rows];
  }

  renderModified () {
    if (this.props.modified.length === 0) {
      return null;
    }
    const header = (
        <tr key="modified-header">
          <td colSpan="2" className="text-center">
            <h6>
              {translateWithParameters(
                  'quality_profiles.x_rules_have_different_configuration',
                  this.props.modified.length
              )}
            </h6>
          </td>
        </tr>
    );
    const secondHeader = (
        <tr key="modified-second-header">
          <td><h6>{this.props.left.name}</h6></td>
          <td><h6>{this.props.right.name}</h6></td>
        </tr>
    );
    const rows = this.props.modified.map(rule => (
        <tr key={`modified-${rule.key}`}
            className="js-comparison-modified">
          <td>
            <div>
              <SeverityIcon severity={rule.left.severity}/>
              {' '}
              <a href={getRulesUrl({ 'rule_key': rule.key })}>
                {rule.name}
              </a>
            </div>
            {rule.left.params != null && (
                <ul>
                  {Object.keys(rule.left.params).map(key => (
                      <li key={key} className="spacer-top">
                        <code>
                          {key}
                          {': '}
                          {rule.left.params[key]}
                        </code>
                      </li>
                  ))}
                </ul>
            )}
          </td>
          <td>
            <div>
              <SeverityIcon severity={rule.right.severity}/>
              {' '}
              <a href={getRulesUrl({ 'rule_key': rule.key })}>
                {rule.name}
              </a>
            </div>
            {rule.right.params != null && (
                <ul>
                  {Object.keys(rule.right.params).map(key => (
                      <li key={key} className="spacer-top">
                        <code>
                          {key}
                          {': '}
                          {rule.right.params[key]}
                        </code>
                      </li>
                  ))}
                </ul>
            )}
          </td>
        </tr>
    ));
    return [header, secondHeader, ...rows];
  }

  render () {
    if (!this.props.inLeft.length && !this.props.inRight.length && !this.props.modified.length) {
      return <ComparisonEmpty/>;
    }

    return (
        <table
            className="data zebra"
            style={{ tableLayout: 'fixed' }}>
          <tbody>
            {this.renderLeft()}
            {this.renderRight()}
            {this.renderModified()}
          </tbody>
        </table>
    );
  }
}
