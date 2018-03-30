import React from 'react';


const MembersOnlyPage = (props) => {
  // in this case, the user prop is getting injected by
  // the ProtectedRoute component, so we don't need to
  // directly use withUser
  const { user } = props;

  return (
    <section>
      <h1>Members Only Area</h1>
      <p>
        Welcome, {user.username}. You can only see this page if you are logged in.
        If any unauthenticated plebs try to access this route, they'll get redirected
        to the login page.
      </p>
    </section>
  )
};

export default MembersOnlyPage;
