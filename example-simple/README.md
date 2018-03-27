# Simple Example Using Passport-Local with a Traditional Server

By "traditional server", I mean a web server that uses simple UI with simple form posts.

The home page hides sensitive data unless you're logged in. The navbar also changes based on whether or not you are logged in. Finally, it has create user and login views.

## Running the Example

1. In a separate terminal window, start monogd
2. Navigate to the root of the repo (the parent of `example-simple`)
3. Run `yarn install`
4. Navigate back to `example-simple`
5. Run `yarn install`.
6. Run `yarn start` to run the server
7. Open your browser and visit [http://localhost:3001](http://localhost:3001

## Highlights

`server.js` is pretty typical express server. We use handlebars as the renderer, body-parser, and connects using mogoose before starting. The most interesting parts are on lines 21 through 28. We have some code in separate modules to _first_ configure Passport and _second_ configure our routes (which have dependencies on passport).

`passport.js` has our passport configuration. The order the various pieces are configured are important. Other than that, there are descriptive comments about what each section is doing. You do NOT have to use sessions, however for typical web apps they are probably the simplest and best way to keep a user logged in once they have logged in. So, I'd recommend setting that up unless you know you definitely don't want or need it.

`routes/htmRoutes.js` contain our routes for the homepage, creating an account, and logging in and logging out. The most important part of the PassportJS integration starts on line 20. This is the route to which our login form POSTs the username and password they entered. This route uses the `passport.authenticate` middleware, which we are instructing to use the `local` strategy. It will call our strategy's verify callback that we configured, which essentially passes in the username/password the user entered and validates the credentials. If the user's credentials are correct, we redirect back to the home page (you can do whatever you want, though). If the credentials are _incorrect_, we send them back to the login page. We are telling `passport.authenticate` to use the `failureFlash` option so that we can send the authentication failure message back to the login page so it can be displayed. You do not need to use this, but it is handy. In order to make this work, you need to install the `connect-flash` middleware and configure it (we configure it on line 37 of `passport.js`). Next, you need to call `req.flash('error')` in the route where you want to read the error message (if there is one). You can see examples on lines 16 and 47 of `htmlRoutes.js`. Basically, what we're doing is creating a data object that includes a flash property set to the result of `req.flash('error')`, which gets sent to the handlebars template that we're rendering. Speaking of which...

The last notable parts are using handlebars to conditionally render based on the data object we pass in. You can see in `views/layouts/main.handlebars`, we look to see if the data object has a `user` property. If they do, we consider the user logged in and show the logged in version of the navbar. Otherwise, the navbar shows a link to log in. Note that our route calling `res.render` needs to pass in a data object with the property called `user` that is equal to the result of `req.user`. This effectively passes the current logged in user for the request to our handlebars templates. You can see it in use on line 9 of `htmlRoutes.js`.

## Production Notes

If you ARE using sessions, you need to use a production-ready session store. A session store is a bit of code that express-session uses to store session data. Without a store, it can't keep track of sessions and the whole thing won't work. By default, express-session has a built-in store that just keeps sessions in memory. That is what we're using here in this example. However, the authors of express-session strongly warn you against using this default store in production. [There are lots of other stores to choose from](https://github.com/expressjs/session#compatible-session-stores), like storing session data in Redis, Memcache, or even a database. I like using Redis to cache information like sessions, but you need a Redis server that your local and production servers can connect to in order to get this working.