// We pull in the DataTypes object and the Model class from the sequelize object
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');

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
      // Checks if the value is at least 6 characters in length
      len: 2
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      // Check if value is a valid email email address
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: 6,
        msg: 'Your password must be at least 6 characters in length.'
      }
    }
  }
}, {
  // Attach our sequelize connection to our model, so it will sync to our database
  sequelize: require('../config/db_connection'),
  // Describe your table - 'user' will create a 'users' table
  modelName: 'user',
  // You can use hooks to jump into the life cycle of a new table item/object at different times - before, after, etc.
  hooks: {
    // We use async/await to avoid having to use nested Promise .then()'s 
    async beforeCreate(user) {
      // Await will stop any code below from running that relies on the awaited value
      // until the awaited value is "resolved"
      // bcrypt.hash() will scramble and hash a string, using salts(levels of encryption)
      const hashed_pass = await bcrypt.hash(user.password, 10);
      // set our user object's password to the hashed version before it's saved to the database
      user.password = hashed_pass;
    }
  }
});

// Use the prototype object to allow all of our newly created user objects to
// use the validatePassword method
// We declare our function as "async" to allow the use of await on promises
User.prototype.validatePassword = async function (password, stored_password) {
  // return the resolved value of the compare() Promise object
  // once it compares the hashed password to the value passed in by the user
  return await bcrypt.compare(password, stored_password);
}

module.exports = User;