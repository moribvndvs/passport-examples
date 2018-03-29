import React from "react";

// checks to see if the session storage already has a user key
// if it does, try to parse it as JSON string into an object, and use
// that as the starting value for state. What this does is effectively
// retain the currently logged in user if the user does a manual refresh
// in their browser. if we don't back the user by something that remains
// between refreshes, the user will "lose" their logged in state.
const stateFromStore = sessionStorage.getItem('user');
let state = stateFromStore ? JSON.parse(stateFromStore) : null;

const subscribers = [];

const unsubscribe = subscriber => {
  const index = subscribers.findIndex(subscriber);
  index >= 0 && subscribers.splice(index, 1);
};
const subscribe = subscriber => {
  subscribers.push(subscriber);
  return () => unsubscribe(subscriber);
};

export const withUser = Component => {
  return class WithUser extends React.Component {
    componentDidMount() {
      this.unsubscribe = subscribe(this.forceUpdate.bind(this));
    }
    render() {
      const newProps = { ...this.props, user: state };
      return <Component {...newProps} />;
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
  };
};

export const update = newState => {
  state = newState;
  // update the "user" key in the session storage with whatever the new state value is
  // Remember to stringify the state object because sessionStorage can only store strings
  sessionStorage.setItem('user', state ? JSON.stringify(state) : null);
  subscribers.forEach(subscriber => subscriber());
};
