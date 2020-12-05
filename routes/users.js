var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )
router.get('/', cors.corsWithOptions, authenticate.verifyUser,  function(req, res, next) {
    User.find({})
    .then((users) => {
      res.statusCode=200;
      res.setHeader('Content-Type','application/json');
      res.json(users);
    })
});

router.get('/:username', cors.corsWithOptions, authenticate.verifyUser,  function(req, res, next) {
  User.findOne({username: req.params.username})
  .then((user) => {
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(user);
  })
});

router.post('/signup',cors.corsWithOptions,  (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
        if (req.body.dob)
        user.dob = req.body.dob;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err},{"mesg":"error hai"});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});



router.post('/login', cors.corsWithOptions, (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
      }
      if(req.body.remember===true)
      var token = authenticate.getToken({_id: req.user._id}, true);
      else
      var token = authenticate.getToken({_id: req.user._id}, false);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', token: token});
    }); 
  }) (req, res, next);
});

module.exports = router;
