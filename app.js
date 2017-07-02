
//---- Imports ----
// Route requests
let express = require('express');

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

// Home
app.get('/', function(req, res){
    res.render('index',{
        title : 'Podcast Fan',
        subs: subscriptions
    });
});

app.post('/addFeed', function(req, res){

    let newFeed = {
        id: 4,
        name: 'New Podcast',
        feed: req.body.feedURL
    };

    console.log(newFeed);

    subscriptions.push(newFeed);

    res.render('index',{
        title : 'Podcast Fan',
        subs: subscriptions
    });
});

app.get('/test', function(req, res){

});

app.listen(3000, function(){
    console.log('Server started on Port 3000...');
})