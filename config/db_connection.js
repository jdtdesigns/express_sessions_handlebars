const { Sequelize } = require('sequelize'); // pull in the constructor

// Set up our connection to the mysql server locally or on the cloud(production)

const connection = new Sequelize( // creates new Sequelize connection object
  'express_sessions_handlebars', // database name
  'root', // username
  '', // password
  { // options object
    host: 'localhost',
    dialect: 'mysql', // database type
    logging: false
  }
);

module.exports = connection; // export the connection object