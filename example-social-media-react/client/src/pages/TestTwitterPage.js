import axios from 'axios';
import React, { Component, Fragment } from 'react';
import { List, ListItem } from 'material-ui/List';
import { withUser } from '../services/withUser';

class TestTwitterPage extends Component {
  state = {
    tweets: null,
    tweetsError: false
  }

  loadTweets() {
    if (this.state.tweets) {
      // if we've already loaded tweets, don't need to reload again
      return;
    }

    axios.get('/api/tweets')
      .then(res => {
        this.setState({
          tweets: res.data
        });
      })
      .catch(err => {
        // if we got an error, that means they probably didn't log in with twitter
        console.log(err);
        this.setState({
          tweets: null,
          playlistError: true
        });
      });
  }

  componentDidMount() {
    this.loadTweets();
  }

  renderTweets() {
    const { user } = this.props; // get the user prop from props
    const { tweets, tweetsError } = this.state; // get tweets from state

    // they aren't logged in yet!
    if (!user) {
      return (
        <div>Hey! You need to log in with Twitter to do this!</div>
      );
    }

    // we found their tweets, so display them!
    if (!tweetsError && tweets) {
      return (
        <div>
          Welcome back, {user.username}! Here are your recent tweets.
          {tweets.length > 0 &&
            <List>
              {tweets.map((item) => <ListItem key={item.id} primaryText={item.text} />)}
            </List>
          }
          {tweets.length === 0 &&
            <p>You don't have any tweets yet!</p>
          }
        </div>
      );
    }

    // we're still loading the tweets
    if (!tweetsError) {
      return (<div>Hold on, I'm loading your tweets...</div>);
    }

    // oops! we had a problem trying to load the tweets. they probably
    // didn't log in using twitter
    return (<div>Oops! We couldn't load your tweets. Maybe you didn't log in using Twitter?</div>);
  }

  render() {


    return (
      <Fragment>
        {this.renderTweets()}
      </Fragment>
    );
  }
}

// withUser function will wrap the specified component in another component that will
// inject the currently logged in user as a prop called "user"
export default withUser(TestTwitterPage);
