import React, { Component } from 'react';
import Toggle from 'react-toggle';
import {Table} from 'reactstrap';

class Methods extends Component {
	constructor(props) {
    super(props);
    this.state = {
      isChecked: null
    }
    this.toggleCheck = this.toggleCheck.bind(this);
	}

	toggleCheck(methodId, authId, event) {
		this.setState({
      isChecked: event.target.checked }, () => {
			this.props.updateAuthenMethod(methodId, this.state.isChecked, authId);
		});
  }

	render() {
    let { methods } = this.props;
		return (
      <React.Fragment>
        {methods && methods.length > 0 &&
              <div>
                <h3>Enrolled Methods</h3>
                <p>Update a specific enrollment of a signature authentication method.</p>
                <Table>
                <thead className="thead-dark">
                  <tr>
                    <th scope="col"> User Presence </th>
                    <th scope="col"> Finger Print </th>
                  </tr>
                </thead>
                <tbody id="auth-tbody">
                    <tr>
                      {methods.map(method => (
                        <td key={method.id}>
                          <Toggle
                          id={method.id}
                          defaultChecked={method.enabled}
                          onChange={e => this.toggleCheck(method.id, method.attributes.authenticatorId, e)}
                        />
                        </td>
                      ))}
                    </tr>
                </tbody>
              </Table>
              <h3>Method Information</h3>
              <p>Response</p>
              <pre>{JSON.stringify(methods, null, 2)}</pre>
              </div>
            }
      </React.Fragment>
		);
	}
}

export default Methods;
