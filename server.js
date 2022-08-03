const express = require('express');
const path = require('path');
// Grab the engine function from the handlebars package object
const { engine } = require('express-handlebars');
const PORT = process.env.PORT || 3333;
// Pull in our sequelize connection object
const db = require('./config/db_connection');
// Package that allows us to attach sessions to the server - temp storage
const session = require('express-session');
// Allows us to store our session data to the database instead of using system memory
// This is extremely important for any app that will have many users logging in/out
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// attach .env to process object
require('dotenv').config();
// Pull in our view routes object from the index file
const { view_routes, auth_routes } = require('./controllers');

// Create our express app object to set up our server
const app = express();

// Share our front end files with the client-side(browser/insomnia/etc.)
app.use(express.static(path.join('front')));
// Set our view engine up as handlebars and use the shortname extension
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
// Allow json to be sent through from the client-side(browser) - req.body
app.use(express.json());
// Allow form data to be sent through and also allow object/array data - req.body
app.use(express.urlencoded({ extended: false }));

// Add session middleware to the server - gives us access to req.session on our routes
app.use(session({
  // This secret string will be compared to the client-side cookie to "authenticate" a user
  secret: process.env.SESSION_SECRET,
  // Stores our session data to the database instead of using server system memory
  store: new SequelizeStore({ db }),
  // If we don't affect/change the session data during a request, this option
  // will allow the the store to "forget" the session at the end of a request
  saveUninitialized: false,
  // Keeps the sequelize store from deleting idle session data
  resave: false,
  // The cookie object allows us to manipulate the client-side cookie - set expiration,
  // set to httpOnly(is not accessible to client JS), etc.
  cookie: {
    // httpOnly: true
  }
}));

// Load our view routes at the root route - localhost:3333/
app.use('/', view_routes);
// Load our auth routes and prefix all those routes with /auth
app.use('/auth', auth_routes);

// Sync our database tables - {force: true} to drop all tables and re-sync
db.sync().then(() => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});