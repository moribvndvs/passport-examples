import axios from 'axios';
import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class CreateAccountPage extends Component {
  state = {
    username: null,
    password: null,
    error: null
  }
  handleInputChanged = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  handleLogin = (event) => {
    event.preventDefault();

    const { username, password } = this.state;
    const { history } = this.props;

    // clear any previous errors so we don't confuse the user
    this.setState({
      error: null
    });

    // check to make sure they've entered a username and password.
    // this is very poor validation, and there are better ways
    // to do this in react, but this will suffice for the example
    if (!username || !password) {
      this.setState({
        error: 'A username and password is required.'
      });
      return;
    }

    // post an auth request
    axios.post('/api/users', {
      username,
      password
    })
      .then(user => {
        // if the response is successful, make them log in
        history.push('/login');
      })
      .catch(err => {

        this.setState({
          error: err.response.data.message || err.message
        });
      });
  }
  render() {
    const { error } = this.state;

    return (
      <Grid fluid>
        <Row>
          <Col xs={6} xsOffset={3}>
            <form onSubmit={this.handleLogin}>
              <h1>Create Account</h1>
              {error &&
                <div>
                  {error}
                </div>
              }
              <div>
                <TextField
                  name="username"
                  hintText="Username"
                  floatingLabelText="Username"
                  onChange={this.handleInputChanged}
                />
              </div>
              <div>
                <TextField
                  name="password"
                  hintText="Password"
                  floatingLabelText="Password"
                  type="password"
                  onChange={this.handleInputChanged}
                />
              </div>
              <div>
                <RaisedButton primary type="submit">
                  Create Account
                </RaisedButton>
              </div>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default CreateAccountPage;
