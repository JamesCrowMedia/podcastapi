
//---- Imports ----
// Route requests
const express = require('express');
// Input validation
const expressValidator = require('express-validator')
// Parse incoming request bodies
const bodyParser = require('body-parser'); 
// Tools for file and directory paths
const path = require('path');
// Convert RSS data to JSON
const request = require('request');
const parsePodcast = require('node-podcast-parser');

//---- Init App ----
const app = express();

//---- Set Up Database ----
// ORM for MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/podcastapi');
let db = mongoose.connection;
//Check for connection and db errors
db.once('open', function(){
    console.log('Connected to MongoDB...');
});
db.on('error', function(err){
    console.log(err);
});

// db Collections
let User = require('./models/user')
let Feed = require('./models/feed')





//---- Middleware ----

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')))

// Validate User Input
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

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

// ---- Controllers ----

// Home
app.get('/', function(req, res){
    Feed.find({}, function(err, feeds){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title:'Podcasts',
        feeds: feeds
      });
    }
  });
});

app.post('/addFeed', function(req, res){

    req.checkBody('feedURL', 'URL is required').isURL();

    let errors = req.validationErrors(mapped=true);

    let feedData = {};
    let feedErrors = {};
    
    request(req.body.feedURL, (err, res, data) => {
        if (err) {
            console.error('Network error', err);
            feedErrors = err;
            return;
        };
        
        parsePodcast(data, (err, data) => {
            if (err) {
                console.error('Parsing error', err);
                feedErrors = err;
                return;
            };
            feedData = data;
            console.log('Title test print 1', feedData.title);
            
            let newFeed = new Feed();
            console.log('Created a new feed');
            console.log('Title test print 2', feedData.title);
            newFeed.title = feedData.title;
            newFeed.feedURL = req.body.feedURL;
            newFeed.siteLink = feedData.link;
            newFeed.imgURL = feedData.image;
            newFeed.description = feedData.description;
            newFeed.language = feedData.language;
            newFeed.categories = feedData.categories;
            newFeed.owner = feedData.owner;

            console.log('Print Feed', newFeed);

            newFeed.save(function(err){
                if(err){
                    console.log('Save Error', err);
                    return;
                };

            });
        });
    });

    res.redirect('/');
});

app.get('/test', function(req, res){

});

app.get('/users', function(req, res){
    
    User.find({}, function(err, allUsers){
        if(err){
            console.log(err);
        } else {
            console.log(allUsers);
            res.render('users', {
                title : 'Podcast Fans',
                users: allUsers
            });
        }
    }); 
});

app.post('/users', function(req, res){

    // req.checkBody('username', 'A valid username is required').isLength({min: 6, max: 20});
    // req.checkBody('password', 'A valid password is required').isLength({min: 6, max: 50});
    // req.checkBody('verify', 'Your passwords must match').isLength({min: 6, max: 50});
    // req.checkBody('email', 'A valid email is required').isLength({min: 6, max: 30});

    let pw_compare = req.body.password === req.body.verify;

    let errors = req.validationErrors(mapped=true);

    if(errors || !pw_compare){
        console.log('errors', 'pw_compare:', pw_compare);
    } else {
        let newUser = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        }; 
        db.users.insert(newUser);
    }
});

app.listen(3000, function(){
    console.log('Server started on Port 3000...');
})

db.on('ready',function() {
    console.log('database connected');
});