import React from 'react';
import { withRouter } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const LoginMenu = (props) => {
  const { onLogOut, user: {username, memberships}, ...otherProps } = props;
  const handleTestSpotifyClick = () => {
    props.history.push('/testspotify');
  }
  const handleTestTwitterClick = () => {
    props.history.push('/testtwitter');
  }
  return (
    <IconMenu
      {...otherProps}
      iconButtonElement={
        <IconButton><MoreVertIcon /></IconButton>
      }
      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <MenuItem primaryText={username} />
      <MenuItem primaryText="Log out" onClick={onLogOut} />
      {
        // show the spotify menu item if their user account is connected to spotify
        memberships.includes('spotify') &&
        <MenuItem primaryText="Test Spotify!" onClick={handleTestSpotifyClick} />
      }
      {
        // show the twitter menu item if their user account is connected to twitter
        memberships.includes('twitter') &&
        <MenuItem primaryText="Test Twitter!" onClick={handleTestTwitterClick} />
      }
    </IconMenu>
  )
};

// because this component is not used in a route, we don't have access to the history prop
// which we need to change the current route. we can get the history prop by wrapping our
// LoginMenu with withRouter, kinda like what withUser does but for routing!
export default withRouter(LoginMenu);
