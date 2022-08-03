const auth_router = require('express').Router();
const User = require('../models/User');
const { isLoggedIn } = require('./helpers');

// Once again, we pass our custom middleware function(isLoggedIn) to our route
// so the user will be redirected back to index if they are still logged in
// We shouldn't allow them to visit an auth view route if they're logged in
auth_router.post('/register', isLoggedIn, (req, res) => {
  // Grab the properties we need from the 
  const { username, email, password } = req.body;

  // Check if any of the required fields are empty
  // You may have checks on the client-side, but it's always important to check
  // on the server-side as well
  if (!username || !email || !password) {
    // If any of the fields are empty, we attach an errors array to the session object
    // check out 
    req.session.errors = ['Please check your credentials and try again.'];
    // Push/Redirect the client back to the root route
    return res.redirect('/register');
  }

  // Find a user by email
  User.findOne({
    where: {
      email
    }
  }).then(user => {
    // If the user already exists, we stop the request and send back an error
    if (user) {
      req.session.errors = ['A user already exists with that email address.'];
      return res.redirect('/register');
    }

    // Create the new user in the database
    User.create(req.body)
      // Once saved, we get the new user object back
      .then(new_user => {
        // Create a new session and store it to the database
        req.session.save(() => {
          // Store our user id on the session object so we use it later for authentication
          req.session.user_id = new_user.id;
          // Push/Redirect the client back to the root route
          res.redirect('/');
        });
      }).catch(err => {
        // If any database validation error occurs, we can save them to the session
        // and redirect back to /register
        // This will then show the errors on the register.hbs view
        req.session.errors = err.errors.map(e => e.message);
        // Redirect allows us to send/push the user back to another route
        res.redirect('/register');
      });
  });
});


auth_router.post('/login', isLoggedIn, (req, res) => {
  const { email, password } = req.body;

  // Once again, we ensure they sent through values for email and password
  if (!email || !password) {
    // Attach errors to the session object
    req.session.errors = ['Please check your credentials and try again.'];
    // Once errors are attached, we redirect them back to /login, so they will
    // see the errors
    return res.redirect('/login');
  }

  User.findOne({
    where: {
      email
    }
  }).then(async user => { //
    // If they're user object is not found, we attach an error and redirect them back
    // to /login to try again or register
    if (!user) {
      req.session.errors = ['No user account found matching that email address.'];
      return res.redirect('/login');
    }

    // Check that the password the user sent from the client-side matches the hashed
    // password stored in the users table
    // This is our custom method we attached to the User model
    const pass_is_valid = await user.validatePass(password, user.password);
    // If the passwords don't match, we attach an error and redirect them back to 
    // the login page
    if (!pass_is_valid) {
      req.session.errors = ['Your password is incorrect'];
      res.redirect('/login');
    }
    // Once the user is validated and no errors have occured, we start a new
    // session and attach the user id to the session object
    req.session.save(() => {
      req.session.user_id = user.id;
      // After storing the user id to the session object, we redirect them back
      // to the root route/index view
      res.redirect('/');
    });
  })
});

// Route that allows a user to log out - kills the session and unauthenticates them
auth_router.get('/logout', (req, res) => {
  // If they are already logged out and we have no session data, we redirect them
  // back to the index view
  if (!req.session.user_id) return res.redirect('/');

  // The session destroy method deletes the session data from the database, so they
  // are no longer authenticated 
  req.session.destroy(() => {
    // Once the session is killed, we redirect them back to the index view
    res.redirect('/');
  });
})

module.exports = auth_router;