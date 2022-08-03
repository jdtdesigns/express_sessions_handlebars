// We pull in the DataTypes object and the Model class from the sequelize object
const { DataTypes, Model } = require('sequelize');

// Create our custom Model and extend the Sequelize Model class, so our model
// inherits all methods and properties
class User extends Model { }

// Use the inherited init() method on our model to describe our table schema
User.init({
  username: {
    type: DataTypes.STRING, // equivalent to VARCHAR(250)
    allowNull: false, // equivalent to NOT NULL
    // We can use the validate object to set up numerous validation 
    // checks on our fields
    validate: {
      len: 2
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: 6
    }
  }
}, {
  // Attach our sequelize connection to our model, so it will sync to our database
  sequelize: require('../config/db_connection'),
  // Describe your table - 'user' will create a 'users' table
  modelName: 'user'
});

module.exports = User;