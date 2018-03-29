# Simple Example Using Passport-Local AND Passport-Spotify AAAAAAND Passport-Twitter, with Express and React

This example is built off the previous example-simple-react. The major additions are that, in addition to signing up using username/password, users have the option to sign up via Spotify _or_ Twitter. And yes, it is possible to set your app up so a user can link multiple social media memberships to their current account. Perhaps I'll set that up in a later example. Also, if your app doesn't need a username/password option or the ability to utilize multiple social media accounts (say, for example, your app exclusively uses Spotify to function, you don't need username/password or any other social media provider). Easy! Just strip out or ignore anything you don't need! This example will still show you how to authenticate using various providers and then connect to their APIs. 

With that in mind, users that log in with Spotify or Twitter will be directed to bonus examples for the respective social media site they logged in with. Be aware, however, that until you refine this app to allow users to add additional social media memberships to an existing account, you'll only be able to see the Twitter example if logged in via Twitter, Spotify via Spotify, and username/password people can only see stuff on the homepage! Why? Well, naturally you need an access token for the respective API you're trying to query, and that comes from the strategy when we log in.

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

(in the root) `shared/models/SocialMediaMembership.js` is a new Mongoose model that we use to keep track of all of the social media accounts a user has linked to their user account. The model describes the type of membership via the `provider` prop (e.g. `"spotify"` or `"twitter"`). It also captures the social media site's ID for the user via the `providerUserId` prop. This is important because this ID is how we can find the user in our local database using the social media account every time they log in. So in essence, this model is the bridge from the social media site to our local user. It's also used to capture any access tokens or other information that social media site may require to access the user's data from that site's API. **WARNING**: You should never store tokens in plaintext anywhere in your application. You'll want to encrypt them before storing, and decrypt them before using them. However, that's beyond the scope of this example so I'm keeping it simple (for now). Google encrypting and decrypting strings in node and you should be able to figure it out from there.

`.env` has configuration keys for local development **ONLY**.

`package.json` has been modified on line 9 to use `dotenv` to load the .env file variables when running in local development mode.

`server.js` is pretty typical express server. We use handlebars as the renderer, body-parser, and connects using mogoose before starting. The most interesting parts are on lines 21 through 28. We have some code in separate modules to _first_ configure Passport and _second_ configure our routes (which have dependencies on passport).

`passport.js` has our passport configuration. The order the various pieces are configured are important. Other than that, there are descriptive comments about what each section is doing. You do NOT have to use sessions, however for typical web apps they are probably the simplest and best way to keep a user logged in once they have logged in. So, I'd recommend setting that up unless you know you definitely don't want or need it. The major difference in this example of passport.js is that we define multiple strategies. Remove any strategies you don't need, and add any you want. See the documentation for your strategy for more info on how to implement it. These examples should give you a good idea on how to start. Here are the basics, though:

1. Search the `SocialMediaMembership` for a record that matches the social media site's user ID and the provider your strategy uses.
2. If we find a matching record, that means the user has logged in before and we can simply let the strategy know. Easy enough.
3. If we _don't_ find a maching record, this is a brand new user. Now, it's up to you how you want to handle this. The simplest thing to do, but you're not required to do, is just create a new user and membership on the spot and consider them logged in. If your app has complex needs, you can set up this workflow however you want. But we're keeping it simple here. Anyway, once you create the new user, let the Strategy know.

Remember to register in the social media provider's developer area to receive a client ID and secret for your app!

`routes/apiRoutes.js` This contains a few routes:

- `/api/auth` is where we go to read, create, or delete our current login session. The create portion (`POST /api/auth`) uses the `passport.authenticate` middleware, which will read the user's credentials they posted and either log them in or return a 401 error. `GET /api/auth` simply returns the currently logged in user's info, if they are logged in. `DELETE /api/auth` will effectively log the user out.
- `/api/users` has a POST route for creating a new user.
- `/api/stuff` is just a test route that returns an array of strings if the user is logged in. if the user is not logged in, it will return a 403 Forbidden error.
- `/api/playlists` is a test route that will load the current user's Spotify playlists. The user must be logged in via Spotify or this won't work, and they'll get a 403.
- `/api/tweets` is another test route that will load the current user's recent tweets. The user must be logged in via Twitter for this to work or they'll get a 403.

`routes/htmlRoutes.js` has a little fancy to it. We define 4 new routes to support Passport authentication to Spotify and Twitter. Since these strategies use OAuth, they require the user to be redirected to a login page on the provider (the provider being Spotify or Twitter, in this example). The provider then asks the user to confirm they want to give access to your app, and if authorized, the provider will redirect _back_ to your app to complete the login process by passing access tokens and profile information to your Strategy. So, each provider needs two routes: 1) `/auth/{provider name}` will initiate the authentication process and 2) `/auth/{provider name}/callback` will complete it. You'll need to register the callback URL in the social media site's developer settings for your app or you'll recieve an error from the site.

Note that we need to add in a little workaround to get the authentication redirects to work properly when running locally in development mode. This is because the front end is running on a separate development server (port 3000) from the backend (port 3001). This isn't necessary for production, but not putting in a workaround like this will make testing it locally hell.

`client/src/services/withUser.js` is a little bit of React magic. We need a single state to track our current user object. We also need to be able to inject that user as a prop to any component that needs to be aware of the current user. Said components also need to have their user prop updated if the user state changes. Finally, we need a way of updating the state from a component so everyone is notified. There are a few ways to do this, but in this example we're using what's called a High Order Component. It comes with a function called `withUser` that can be called to wrap any component. It will then do exactly what was described above: it will ensure your wrapped component receives a user prop and keep it up-to-date if the user state changes. It also has an `update` function that can be imported and called by any component that needs to change the state (as you can see in `client/src/pages/LoginPage.js`).

This is a greatly simplified version of what you might see in Flux or Redux. You can use Flux, Redux, etc. if you want a more mature approach that can be used to track other states your app needs if you want, but be aware the learning curve for something like Redux is deceptively high.

`client/src/pages/TestTwitterPage` and `TestSpotifyPage` simply detect if the user is logged in, and if so, retrieves the respective test data and displays it.

`client/src/pages/LoginPage` and `CreateAccountPage` have been updated to add social media login links to our Express backend routes to initiate the authentication redirects. Again, we had to add in a workaround to deal with the fact that the backend redirect routes are on a different port than the front end.

`client/src/components/LoginMenu.js` has been updated to show additional menu items in the dropdown based on whether or not the user has the respective social media membership.

Finally, the React app is using `material-ui` and `react-flexbox-grid` for UI. You obviously don't need to use these modules, and use your favorite react component library.

## Production Notes

Your strategies (and possibly other parts of your application) receive sensitive but critical confguration values via environmental variables. Locally, we are using `dotenv` to load these keys and values from the `.env` file. This is NOT how you should configure environmental variables in production. Instead, you'll need to refer to your host's instructions on how to best do that. With Heroku, you simply log into the dashboard for your app, click on Settings, find Config Variables, and click Reveal Config Vars. Simply add an entry for each variable named the same as it is in the .env file (or used in your code via `process.env.[key name here]`), and type in the associated value. Heroku keeps these saved securely for your app, and ensures those keys are fed into your app when it runs.

Client-side validation is important. The forms used to create an account and log in do bare minimum validation and are probably not suitable for a real application. You might want to use a validation module or form module with built-in validation for React.

If you ARE using sessions, you need to use a production-ready session store. A session store is a bit of code that express-session uses to store session data. Without a store, it can't keep track of sessions and the whole thing won't work. By default, express-session has a built-in store that just keeps sessions in memory. That is what we're using here in this example. However, the authors of express-session strongly warn you against using this default store in production. [There are lots of other stores to choose from](https://github.com/expressjs/session#compatible-session-stores), like storing session data in Redis, Memcache, or even a database. I like using Redis to cache information like sessions, but you need a Redis server that your local and production servers can connect to in order to get this working.