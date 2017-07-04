
//---- Imports ----
// Route requests
const express = require('express');
// Input validation
const expressValidator = require('express-validator')
// Parse incoming request bodies
const bodyParser = require('body-parser'); 
// Tools for file and directory paths
const path = require('path');
// ORM for MongoDB
const mongojs = require('mongojs');
const mongoDB = require('mongodb');
var db = mongojs('podcastapi', ['users'])

const app = express();
let ObjectId = mongojs.ObjectId;


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


// ---- TEMP Code for testing ----

let subscriptions = [
    {
        id: 1,
        name: 'Serious Inquiries Only',
        feed: 'http://seriouspod.libsyn.com/'
    },
    {
        id: 2,
        name: 'Opening Arguments',
        feed: 'http://openargs.libsyn.com/'
    },
    {
        id: 3,
        name: 'Reply All',
        feed: 'http://feeds.megaphone.fm/replyall'
    }
];


// ---- Controllers ----

// Home
app.get('/', function(req, res){
    res.render('index',{
        title : 'Podcast Fan',
        subs: subscriptions
    });
});

app.post('/addFeed', function(req, res){

    req.checkBody('feedURL', 'URL is required').isURL();

    let errors = req.validationErrors(mapped=true);

    if(errors){
        console.log('errors');
    } else {
        let newFeed = {
            id: 4,
            name: 'New Podcast',
            feed: req.body.feedURL
        }; 
        console.log('success');
        console.log(newFeed);
        subscriptions.push(newFeed);
    }

    res.render('index',{
        title : 'Podcast Fan',
        errors: errors,
        subs: subscriptions
    });
});

app.get('/test', function(req, res){

});

app.get('/users', function(req, res){
    
    db.users.find(function(err, docs){
        // console.log("Test", err, docs);
        res.render('users', {
            title : 'Podcast Fans',
            users: docs
        })
    });
});

app.post('/users', function(req, res){

    req.checkBody('username', 'A valid username is required').isLength({min: 6, max: 20});
    req.checkBody('password', 'A valid password is required').isLength({min: 6, max: 50});
    req.checkBody('verify', 'Your passwords must match').isLength({min: 6, max: 50});
    req.checkBody('email', 'A valid email is required').isLength({min: 6, max: 30});

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

    db.users.find(function(err, docs){
        // console.log("Test", err, docs);
        res.render('users', {
            title : 'Podcast Fans',
            errors: errors,
            users: docs
        })
    });
});

app.delete('/users/delete/:id', function(req, res){
    console.log(req.params.id);
    db.users.remove({_id: ObjectId(req.params.id), function(err, result){
        if(err){
            console.log(err);
        } else {
            res.redirect('/users');
        };
    }});
});

app.listen(3000, function(){
    console.log('Server started on Port 3000...');
})

db.on('ready',function() {
    console.log('database connected');
});