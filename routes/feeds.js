// Route requests
const express = require('express');
const router = express.Router();

let Feed = require('../models/feed');
let User = require('../models/user');
let Episode = require('../models/episode');

router.get('/', ensureAuthenticated, function(req, res){
    let userId = req.user._id;
    User.findOne({_id: userId})
    .populate('feeds')
    .exec(function(err, user){

        if(err){
        console.log(err);
        } else {
        res.render('./feeds/viewFeeds', {
            title:'Podcasts',
            feeds: user.feeds
        });
        }
  });
});

router.get('/episodes/:feedId', ensureAuthenticated, function(req, res){
    const userId = req.user._id;
    const feedId = req.params.feedId;

    let exitCallback = function(messageType, message, route){
        req.flash(messageType, message);
        res.redirect(route);
    }
    Feed.findById(feedId, function(err, feed){
        if(err){
                req.flash('warning', 'Error finding feed');
                res.redirect('/feeds');
            }
        User.findById(userId, function(err, user){
            if(err){
                req.flash('warning', 'Error finding user');
                res.redirect('/user/logout');
            }
            User.GetEpisodes(user, feed, exitCallback, function(feed, episodes){
                res.render('./feeds/viewEpisodes', {
                    episodes: episodes
                });
            });
        });
    });
});

router.get('/subscribe', ensureAuthenticated, function(req, res){

    const userId = req.user._id;

    res.render('./forms/addfeed');
});

router.post('/subscribe', ensureAuthenticated, function(req, res){

    let incomingUrl = req.body.feedURL;
    let userId = req.user._id;
    req.check('feedURL', 'URL is required').notEmpty().isURL();

    //let errors = req.validationErrors(mapped=true);

    let exitCallback = function(messageType, message, route){
        req.flash(messageType, message);
        res.redirect(route);
    }

    req.getValidationResult().then(function(result) {
        // do something with the validation result  
        if(!result.isEmpty()){
            console.log('Invalid URL');
            req.flash('warning', 'Invalid URL');
            res.redirect('/feeds');
        } else {

            User.findOne({_id: userId}, function(err, user){
                Feed.ParseFeed(incomingUrl, exitCallback, function(meta, articles, feedURL){

                    Feed.Subscribe(meta, articles, feedURL, user, function(newFeed, articles, feedURL){

                        Episode.AddEpisodes(newFeed, articles, feedURL, exitCallback, function(feed, episode){
            
                            User.LinkUserToEpisode( feed, episode, user);
                        }); 
                    });
                });
            });
        }
    });
});

router.post('/unsubscribe/:feedId', ensureAuthenticated, function(req, res){
    const userId = req.user._id;
    const feedId = req.params.feedId;

    let exitCallback = function(messageType, message, route){
        req.flash(messageType, message);
        res.redirect(route);
    }


    User.findById(userId, function(err, user){
        if(err){
            req.flash('warning', 'Error unsubscribing feed');
            res.redirect('/feeds');
        }

        
        Feed.Unsubscribe(user, feedId, exitCallback);

    });
});


// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/user/login');
  }
}

module.exports = router;