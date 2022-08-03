const express = require('express');
const path = require('path');
// Grab the engine function from the handlebars package object
const { engine } = require('express-handlebars');
const PORT = process.env.PORT || 3333;
// Pull in our sequelize connection object
const db = require('./config/db_connection');
// attach .env to process object
require('dotenv').config();
// Pull in our view routes object from the index file
const { view_routes } = require('./controllers');

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

// Load our view routes at the root route - localhost:3333/
app.use('/', view_routes);

// Sync or database tables - {force: true} to drop all tables and re-sync
db.sync().then(() => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});