import axios from 'axios';
import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

let baseUrl = '';

// This is a hack to get around the fact that our backend server
// that social media sites need to call back to is on a different
// port than our front end when we're running in development mode
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  baseUrl = 'http://localhost:3001';
}

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
          <Col xs={4} xsOffset={4}>
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
                <RaisedButton
                  primary
                  type="submit"
                  label="Create Account"
                />
              </div>
              <p>Or</p>
              <div>
                <RaisedButton
                  href={`${baseUrl}/auth/spotify`}
                  backgroundColor="#1ed760"
                  labelColor="#ffffff"
                  label="Sign up with Spotify"
                />
              </div>
              <div>
                <RaisedButton
                  href={`${baseUrl}/auth/twitter`}
                  backgroundColor="#1da1f2"
                  labelColor="#ffffff"
                  label="Log in with Twitter"
                />
              </div>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default CreateAccountPage;
