# PassportJS Examples

This repository contains several example configurations using PassportJS as authentication middleware. PassportJS is very flexible, at a cost of being a bit confusing to set up and tailor to your particular application's needs.

Please note this repository is NOT a conclusive or exhaustive list of ways you can leverage PassportJS.

## Project Structure

To save myself time and typing, I will reuse as much code as possible. I will also make each example as simple as possible while demonstrating functionality and proper structure. 

Here's what's inside:

- `shared`: This folder contains any code that is shared between all the examples, like user models and utilities.
- `shared/middleware`: This folder contains any common middleware for setting up internals of the server, like connecting to mongoose.
- `shared/models`: This folder contains any common mongoose models, most importantly it has our User model.

### Examples

- `example-simple`: A very simple Express server that uses Handlebars and basic form posts to authenticate users using the `passport-local` strategy. See the README in that folder for more info.
- `example-simple-react`: A very simple express server that uses React and the `passport-local` strategy. This example also shows a way to ensure someone can't access a route unless they are logged in (see `/shared/middleware/mustBeLoggedIn.js`). This could actually be used in any express server using passport on any route.
- `example-social-media-react`: A refinement of the simple React app, but supports multiple social media logins in addition to username/password. As an added bonus, it shows how to use access tokens provided by the social media site's passport strategy to access the user's data from the social media site's API. In this example, users that log in via Spotify can retrieve their playlists, and likewise for Twitter users' tweets.


## Miscellaneous

- Any examples that use server-side template rendering are using Handlebars. Pug is better :), but this set of examples was built primarily for Bootcamp students that were taught Handlebars. Using Pug instead is quite easy, but that exercise is left to you at the moment.

## What is PassportJS

PassportJS is a Node package intended to be used with the ExpressJS web applications. It can be dropped into your application to add authentication support. Your application will instruct PassportJS to use one or more **Strategies**. 

### Strategies

A Strategy is like middleware for PassportJS that attempts to authenticate a user based on a request. How the Strategy authenticates a user is dependent on the Strategy implementation you decide to use. Strategies can vary from simple, such as [LocalStrategy](https://github.com/jaredhanson/passport-local) who simply authenticates a user using username/password against your application (usually using a database), to a more complex strategy using OAuth 2 that allows users to log in using a socia media account. There are [500+ strategies](http://www.passportjs.org/packages/), so the place to start is determining how you want users to be able to authenticate. Start simple and add from there; remember that your app is allowed to use several strategies.

#### Do you want users to be able to sign up using username and password?

Use the [passport-local](https://github.com/jaredhanson/passport-local) package for the LocalStrategy. Users will simply authenticate using a username and password, and you'll configure the strategy on how to find the user in your database and then check the provided password is correct.

**Caveat**: This is effectively managing the account's username and password inside your application. Security is HARD and absolutely CRITICAL. So if you're not ready for secure password management, go with a social media identity provider (Google, Twitter, Facebook, etc.) instead. Additionally, if your app will only work by accessing a user's data on a social media site, then you should _not_ use LocalStrategy, but the strategy for that social media site.

#### Do you need to access a social media API on behalf of a user?

Use the appropriate strategy for the social media site. Here are some common strategies:

- Google: [passport-google-oauth](https://github.com/jaredhanson/passport-google-oauth)
- Twitter: [passport-twitter](https://github.com/jaredhanson/passport-twitter)
- Spotify: [passport-spotify](https://github.com/JMPerez/passport-spotify)
- Facebook: [passport-facebook](https://github.com/jaredhanson/passport-facebook)

#### Do you want to have a mix of local and social media accounts, or have advanced API authentication requirements and don't want to do all the auth code yourself?

Consider signing up for Auth0. Security is hard, and if you're not comfortable doing it or ready to take on the responsibility, let the pros do it for you. It's free to start, can secure your APIs, and allows you to easily implement authentication using any variety of identity providers, including custom username/password database, Facebook, Google, etc. Auth0 does the heavy lifting for securely managing credentials, OAuth 2 exchanges between your apps and the identity providers, and all you need to do is drop a little code and some config values into your app. It also makes many other advanced authn/authz tasks easy for you, like SSO, SAML, and a whole slew of other things.

The Auth0 team has provided the [passport-auth0](https://github.com/auth0/passport-auth0) to drop into your app. You can get more detailed and ready-to-cut-and-paste code once you create an account and create your first client in your account.