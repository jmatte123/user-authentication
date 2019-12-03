
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const logger = require('morgan');
const User = require('./user');
var jwt = require('jsonwebtoken');

const API_PORT = 9000;
const app = express();

var corsOptions = {
  origin: false,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
const router = express.Router();

// this is our MongoDB database
const dbRoute = 'mongodb://127.0.0.1:27017/UserAuth';

// connects our back end code with the database
mongoose.connect(dbRoute, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true, 
  useFindAndModify: false 
});
let db = mongoose.connection;

// connect to the database
db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// use the morgon logger to log the api requests
app.use(logger('dev'));

// this method will send a authentication token back to the client if
// the user and password are correct.
router.get('/authenticate', (req, res) => {
  User.find({ 
    username: req.query.username,
    password: req.query.password
   }, (err, user) => {
    if (err || user.length <= 0) return res.json({ 
      success: false,
      error: err 
    });
    token = jwt.sign(
      { username: user.username }, 
      'thisIsAInventoryManagementSystem123', 
      { expiresIn: 120}
    );
    return res.send(token);
  });
});

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  User.find({ 
    username: req.query.username,
    password: req.query.password
   }, (err, user) => {
    if (err || user.length <= 0) return res.json({ 
      success: false, 
      user: user.length,
      error: err 
    });
    return res.json({ 
      success: true, 
      user: user.length,
      user: user 
    });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
  const { username, password, permission } = req.query;
  if (username === undefined) return res.json({
    success: false,
    username: undefined
  });
  User.findOne({ username: username }, (err, user) => {
    if (err) return res.json({ 
      success: false, 
      error: err 
    });
    if (req.query.username != undefined) user.username = username;
    if (req.query.password != undefined) user.password = password;
    if (req.query.permission != undefined) user.permission = permission;
    user.save();
    return res.json({ 
      success: true,
      updatedUser: user
    });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
  const username = req.query.username;
  User.findOne({ 'username': username }, (err, user) => {
    if (err) return handleError(err);
    if (user.permission === "admin") {
      User.findOneAndDelete(username, (err) => {
        if (err) return res.json({ 
          success: false, 
          error: err 
        });
        return res.json({ 
          success: true,
          removedUser: username
        });
      });
    }
  });
});

// this is our create methid
// this method adds new data in our database
router.post('/putData', (req, res) => {
  let user = new User();
  const { username, password, permission, firstName, lastName } = req.query;
  user.username = username;
  user.password = password;
  user.permission = permission;
  user.firstName = firstName;
  user.lastName = lastName;
  user.save((err) => {
    if (err) return res.json({ 
      success: false, 
      error: err 
    });
    return res.json({ 
      success: true 
    });
  });
});

// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));