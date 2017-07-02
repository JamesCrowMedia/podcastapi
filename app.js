
//---- Imports ----
// Route requests
let express = require('express');
// Input validation
let expressValidator = require('express-validator')
// Parse incoming request bodies
let bodyParser = require('body-parser'); 
// Tools for file and directory paths
let path = require('path');


const app = express();



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

app.listen(3000, function(){
    console.log('Server started on Port 3000...');
})