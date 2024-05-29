var express = require('express');
var router = express.Router();
var userhelper = require('../helpers/user-helper');
const session = require('express-session');
const { response } = require('../app');
const { helpers } = require('handlebars');


//middleware for login
const login = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.session.formData = req.body;
    res.redirect('/signIn');
  }
}



/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;
  res.render('users/index', { user, title: 'Express', main: true });
});

router.get('/lostSomething', (req, res) => {
  let user = req.session.user;
  res.render('users/lostSomething', { user, title: 'Add Your Thing', ls: true })
})

router.get('/govAutherized', (req, res) => {
  let user = req.session.user;
  res.render('users/products/gov', { user, title: 'Select Details', ls: true })
})

router.get('/other', (req, res) => {
  let user = req.session.user;
  res.render('users/products/otherstuffs', { user, title: 'Select Details', ls: true })
})

router.get('/signIn', (req, res) => {
  res.render('users/login', { title: 'Log In', sn: true })
})

router.get('/signup', (req, res) => {
  res.render('users/signup', { title: 'Create Account', sp: true })
})

router.post('/signup', (req, res) => {
  userhelper.DoSignUp(req.body).then((response) => {
    console.log(req.body);
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response.username;
    req.session.mail = req.body.mail;


    if (req.session.formData) {
      // Append email to the formData before saving
      const detailsToSave = {
        ...req.session.formData,
        email: req.body.mail
      };

      console.log(req.session.formData.category);
      // Determine which helper function to use based on the form data or some identifier
      const helperFunction = req.session.formData.check === 'found' ? userhelper.FoundItems : userhelper.AddDetails;

      // Insert the form data along with the email into the database
      helperFunction(detailsToSave).then(() => {
        console.log("Data inserted successfully");
        req.session.formData = null; // Clear the formData from session after saving
        res.redirect('/signIn'); // Redirect to home or another appropriate route after successful insertion
      }).catch(error => {
        console.error("Error inserting data: ", error);
        res.status(500).send("Failed to insert form data");
      });
    } else {
      console.log("Messed Up bro");
      // No form data to process, redirect to home or another appropriate route
      res.redirect('/');
    }
  })
})


router.post('/login', (req, res) => {
  userhelper.DoLogIn(req.body).then((response) => {
    if (response.status) {
      // Setting the session variables
      req.session.loggedIn = true;
      req.session.user = response.user;
      req.session.mail = response.user.mail; // Assuming response.user.mail contains the user's email
      console.log(response.user.mail);

      // Check if there is form data stored in the session to be saved
      if (req.session.formData) {
        // Append email to the formData before saving
        const detailsToSave = {
          ...req.session.formData,
          email: response.user.mail
        };

        console.log(req.session.formData.category);
        // Determine which helper function to use based on the form data or some identifier
        const helperFunction = req.session.formData.check === 'found' ? userhelper.FoundItems : userhelper.AddDetails;

        // Insert the form data along with the email into the database
        helperFunction(detailsToSave).then(() => {
          console.log("Data inserted successfully");
          req.session.formData = null; // Clear the formData from session after saving
          res.redirect('/'); // Redirect to home or another appropriate route after successful insertion
        }).catch(error => {
          console.error("Error inserting data: ", error);
          res.status(500).send("Failed to insert form data");
        });
      } else {
        // No form data to process, redirect to home or another appropriate route
        res.redirect('/');
      }
    } else {
      console.log("Login failed");
      res.status(401).send("Login failed"); // Send a response on failed login
    }
  }).catch(error => {
    console.error("Error during login: ", error);
    res.status(500).send("Internal Server Error");
  });
});



router.post('/submitGov', login, (req, res, next) => {

  const details = {
    email: req.session.user.mail,
    ...req.body // Spread syntax to copy all properties from req.body into the new object
  };

  userhelper.AddDetails(details).then((response) => {
    console.log(response);
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

// Route to display all items (default view)
router.get('/views', (req, res) => {
  userhelper.GetItems().then((product) => {
    res.render('users/view', { title: "View", product });
  }).catch((error) => {
    console.error("Error fetching items: ", error);
    res.status(500).send("Internal Server Error");
  });
});

// Route to display items based on the check parameter
router.get('/views/:check', (req, res) => {
  const check = req.params.check;

  if (check === 'check1') {
    console.log(check);
    userhelper.GetItems().then((product) => {
      res.render('users/view', { title: "View - Check1", product, found: [] });
    }).catch((error) => {
      console.error("Error fetching items: ", error);
      res.status(500).send("Internal Server Error");
    });
  } else if (check === 'check2') {
    console.log(check);
    userhelper.GeFound().then((found) => {
      res.render('users/view', { title: "View - Check2", product: [], found });
    }).catch((error) => {
      console.error("Error fetching found items: ", error);
      res.status(500).send("Internal Server Error");
    });
  } else {
    res.send("No data to show");
  }
});


router.get('/foundsomething', (req, res) => {
  let user = req.session.user;
  res.render('users/foundsomething', { user, title: "What did you found ?", fs: true });
})

router.get('/found_gov', (req, res, next) => {
  let user = req.session.user;
  res.render('users/found/gov.hbs', { title: 'found something', user, fs: true })
})

router.post('/foundGov', login, (req, res) => {
  const details = {
    email: req.session.user.mail,
    ...req.body
  }


  userhelper.FoundItems(details).then((response) => {
    console.log(response);
  })
})

module.exports = router;