
//---- Imports ----
// Route requests
const express = require('express');
// User session tools
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
// Input validation
const expressValidator = require('express-validator');
// Session messages
const flash = require('connect-flash');
// Parse incoming request bodies
const bodyParser = require('body-parser');
// Tools for file and directory paths
const path = require('path');
// System for managing user logins
const passport = require('passport');
// Allow Cross-Origin Resource Sharing
const cors = require('cors')

// Convert RSS data to JSON
const request = require('request');
const parsePodcast = require('node-podcast-parser');

//---- Init App ----
const app = express();

//---- Set Up Database ----
// ORM for MongoDB
const dBconfig = require('./config/database');
const mongoose = require('mongoose');
mongoose.connect(dBconfig.database);
let db = mongoose.connection
//Check for connection and db errors
db.once('open', function(){
    console.log('Connected to MongoDB...');
});
db.on('error', function(err){
    console.log(err);
});

// db Collections
let User = require('./models/user');
let Feed = require('./models/feed');

// Secrets kept out of public repo
const secrets = require('./secrets/app_SECRET');




//---- Middleware ----
// CORS
const corsOptions = {
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200
}


// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// View Engine
// TODO: Replace EJS with something like pug
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// User Sessions
app.use(session({
  secret: secrets.session,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({url: dBconfig.database})
}));

// Express Messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Validate User Input
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'), 
      root    = namespace.shift(), 
      formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Passport Config
require('./config/passport')(passport)
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});


// Set Static Path
app.use(express.static(path.join(__dirname, 'public')))
app.use('/bower_components',  express.static(__dirname + '/bower_components'));



// ---- Controllers ----

// Home
app.get('/', function(req, res){
    res.redirect('/feeds');
});

// Routes
let feedsRoute = require('./routes/feeds');
app.use('/feeds', feedsRoute);

let userRoute = require('./routes/user');
app.use('/user', userRoute);

let api_v1Route = require('./routes/api_v1');
app.use('/v1', cors(corsOptions), api_v1Route);

// let clientRoute = require('./routes/clients');
// app.use('/clients', clientRoute);




app.listen(3000, function(){
    console.log('Server started on Port 3000...');
})

db.on('ready',function() {
    console.log('database connected');
});