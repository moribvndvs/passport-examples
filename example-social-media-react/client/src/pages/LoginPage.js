import axios from 'axios';
import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { update } from '../services/withUser';

let baseUrl = '';

// This is a hack to get around the fact that our backend server
// that social media sites need to call back to is on a different
// port than our front end when we're running in development mode
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  baseUrl = 'http://localhost:3001';
}

class LoginPage extends Component {
  state = {
    username: null,
    password: null
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

    // post an auth request
    axios.post('/api/auth', {
      username,
      password
    })
    .then(user => {
      // if the response is successful, update the current user and redirect to the home page
      update(user.data);
      history.push('/');
    })
    .catch(err => {
      // an error occured, so let's record the error in our state so we can display it in render
      // if the error response status code is 401, it's an invalid username or password.
      // if it's any other status code, there's some other unhandled error so we'll just show
      // the generic message.
      this.setState({
        error: err.response.status === 401 ? 'Invalid username or password.' : err.message
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
              <h1>Log In</h1>
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
                  label="Log in"
                />
              </div>
              <div>
                <RaisedButton
                  href={`${baseUrl}/auth/spotify`}
                  backgroundColor="#1ed760"
                  labelColor="#ffffff"
                  label="Log in with Spotify"
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
              <p>
                New here? <Link to="/create">
                Sign up!
                </Link>
              </p>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default LoginPage;
