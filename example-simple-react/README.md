# Simple Example Using Passport-Local with Express and React

The home page hides sensitive data unless you're logged in. The navbar also changes based on whether or not you are logged in. Finally, it has create user and login views.

## Running the Example

1. In a separate terminal window, start monogd
2. Navigate to the root of the repo (the parent of `example-simple-react`)
3. Run `yarn install`
4. Navigate back to `example-simple-react`
5. Run `yarn install`.
6. `cd client`
7. `yarn install`
8. `cd ..`
9. Run `yarn start` to run the server
10. Create-react-app will start your express server and launch your browser to http://localhost:3000 for you.

## Highlights

`server.js` is pretty typical express server. We use handlebars as the renderer, body-parser, and connects using mogoose before starting. The most interesting parts are on lines 21 through 28. We have some code in separate modules to _first_ configure Passport and _second_ configure our routes (which have dependencies on passport).

`passport.js` has our passport configuration. The order the various pieces are configured are important. Other than that, there are descriptive comments about what each section is doing. You do NOT have to use sessions, however for typical web apps they are probably the simplest and best way to keep a user logged in once they have logged in. So, I'd recommend setting that up unless you know you definitely don't want or need it.

`routes/apiRoutes.js` This contains a few routes:

- `/api/auth` is where we go to read, create, or delete our current login session. The create portion (`POST /api/auth`) uses the `passport.authenticate` middleware, which will read the user's credentials they posted and either log them in or return a 401 error. `GET /api/auth` simply returns the currently logged in user's info, if they are logged in. `DELETE /api/auth` will effectively log the user out.
- `/api/users` has a POST route for creating a new user.
- `/api/stuff` is just a test route that returns an array of strings if the user is logged in. if the user is not logged in, it will return a 403 Forbidden error.

`routes/htmlRoutes.js` merely renders the index.html in client/build for any route (other than our API routes). This is to make the client-side react-router experience work correctly.

`client/src/services/withUser.js` is a little bit of React magic. We need a single state to track our current user object. We also need to be able to inject that user as a prop to any component that needs to be aware of the current user. Said components also need to have their user prop updated if the user state changes. Finally, we need a way of updating the state from a component so everyone is notified. There are a few ways to do this, but in this example we're using what's called a High Order Component. It comes with a function called `withUser` that can be called to wrap any component. It will then do exactly what was described above: it will ensure your wrapped component receives a user prop and keep it up-to-date if the user state changes. It also has an `update` function that can be imported and called by any component that needs to change the state (as you can see in `client/src/pages/LoginPage.js`).

This is a greatly simplified version of what you might see in Flux or Redux. You can use Flux, Redux, etc. if you want a more mature approach that can be used to track other states your app needs if you want, but be aware the learning curve for something like Redux is deceptively high.

Finally, the React app is using `material-ui` and `react-flexbox-grid` for UI. You obviously don't need to use these modules, and use your favorite react component library.

## Production Notes

Client-side validation is important. The forms used to create an account and log in do bare minimum validation and are probably not suitable for a real application. You might want to use a validation module or form module with built-in validation for React.

If you ARE using sessions, you need to use a production-ready session store. A session store is a bit of code that express-session uses to store session data. Without a store, it can't keep track of sessions and the whole thing won't work. By default, express-session has a built-in store that just keeps sessions in memory. That is what we're using here in this example. However, the authors of express-session strongly warn you against using this default store in production. [There are lots of other stores to choose from](https://github.com/expressjs/session#compatible-session-stores), like storing session data in Redis, Memcache, or even a database. I like using Redis to cache information like sessions, but you need a Redis server that your local and production servers can connect to in order to get this working.