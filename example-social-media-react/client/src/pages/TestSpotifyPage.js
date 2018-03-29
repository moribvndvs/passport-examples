import axios from 'axios';
import React, { Component, Fragment } from 'react';
import { List, ListItem } from 'material-ui/List';
import { withUser } from '../services/withUser';

class TestSpotifyPage extends Component {
  state = {
    playlists: null,
    playlistError: false
  }

  loadPlaylists() {
    if (this.state.playlists) {
      // if we've already loaded playlists, don't need to reload again
      return;
    }

    axios.get('/api/playlists')
      .then(res => {
        this.setState({
          playlists: res.data.items
        });
      })
      .catch(err => {
        // if we got an error, that means they probably didn't log in with spotify
        console.log(err);
        this.setState({
          playlists: null,
          playlistError: true
        });
      });
  }

  componentDidMount() {
    this.loadPlaylists();
  }

  renderPlaylists() {
    const { user } = this.props; // get the user prop from props
    const { playlists, playlistError } = this.state; // get playlists from state

    // they aren't logged in yet!
    if (!user) {
      return (
        <div>Hey! You need to log in with Spotify to do this!</div>
      );
    }

    // we found their playlists, so display them!
    if (!playlistError && playlists) {
      return (
        <div>
          Welcome back, {user.username}! Here are your private playlists.
          {playlists.length > 0 &&
            <List>
              {playlists.map((item) => <ListItem key={item.id} primaryText={item.name} />)}
            </List>
          }
          {playlists.length === 0 &&
            <p>You don't have any playlists yet!</p>
          }
        </div>
      );
    }

    // we're still loading the playlists
    if (!playlistError) {
      return (<div>Hold on, I'm loading your playlists...</div>);
    }

    // oops! we had a problem trying to load the playlists. they probably
    // didn't log in using spotify
    return (<div>Oops! We couldn't load your playlists. Maybe you didn't log in using Spotify?</div>);
  }

  render() {


    return (
      <Fragment>
        {this.renderPlaylists()}
      </Fragment>
    );
  }
}

// withUser function will wrap the specified component in another component that will
// inject the currently logged in user as a prop called "user"
export default withUser(TestSpotifyPage);
