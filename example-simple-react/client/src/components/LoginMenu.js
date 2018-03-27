import React from 'react';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const LoginMenu = (props) => {
  const { onLogOut, username, ...otherProps } = props;
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
    </IconMenu>
  )
};

export default LoginMenu;
