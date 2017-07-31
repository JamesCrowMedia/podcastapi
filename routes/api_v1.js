// Route requests
const express = require('express');
const router = express.Router();

let Feed = require('../models/feed');
let User = require('../models/user');
let Episode = require('../models/episode');

router.get('/', function(req, res){
    
});

router.post('/parse', function(req, res){
    let incomingUrl = req.body.feedURL;
    req.check('feedURL', 'URL is required').notEmpty().isURL();
    let exitCallback = function(){
         res.json({message: "Bad URL", messageType: "warning"});
    }
    req.getValidationResult().then(function(result) {
        // do something with the validation result  
        if(!result.isEmpty()){
            res.json({message: "Bad URL", messageType: "warning"});
        } else {
            Feed.ParseFeed(incomingUrl, exitCallback, function(meta, articles, feedURL){
                
                if(meta["#ns"]){
                    delete meta["#ns"]
                }
                if(meta["@"]){
                    delete meta["@"]
                }
                if(articles[0].meta){
                    articles.forEach(function(episode) {
                        delete episode.meta
                    })
                }
                
                
                res.json({message: "Parsed RSS data for " + feedURL, 
                    messageType: "success",
                    feed: meta,
                    episodes: articles
                })
            })
        }
    })
});

router.post('/feeds', function(req, res){
    let userId = req.body.userId;
    console.log(userId)
    User.findById(userId)
    .populate('feeds')
    .exec(function(err, user){
        if(err){
        console.log(err);
        } else {
        res.json({message: "Feed data for " + user.username, 
                messageType: "success",
                feeds: user.feeds.sort(function(a, b){
                        var x = a.title.toLowerCase();
                        var y = b.title.toLowerCase();
                        if (x < y) {return -1;}
                        if (x > y) {return 1;}
                        return 0;                    
                    })
                })
        }
  });
});

router.post('/feeds/subscribe', function(req, res){

    let incomingUrl = req.body.feedURL;
    let userId = req.body.userId;
    let responseSent = false;
    
    req.check('feedURL', 'URL is required').notEmpty().isURL();

    //let errors = req.validationErrors(mapped=true);

    let exitCallback = function(messageType, message){
        res.json({message: message, messageType: messageType});
    }

    req.getValidationResult().then(function(result) {
        // do something with the validation result  
        
        if(!result.isEmpty()){
            console.log('Invalid URL');
            res.json({message: "Could not subscribe to feed", messageType: "warning"});

        } else {

            User.findById(userId, function(err, user){
                console.log('user.fineOne');
                Feed.ParseFeed(incomingUrl, exitCallback, function(meta, articles, feedURL){
                    console.log('feed.parse');
                    Feed.Subscribe(meta, articles, feedURL, user, function(newFeed, articles, feedURL){
                        console.log("feed.subscribe")
                        Episode.AddEpisodes(newFeed, articles, feedURL, exitCallback, function(feed, episode){
                            console.log("episode.AddEpisodes")
                            User.LinkUserToEpisode( feed, episode, user);
                            console.log("episode.LinkUserEpisode")
                        }); 
                    });
                });
            });
        }
    });
});

router.post('/feeds/:feedId', function(req, res){
    const userId = req.body.userId;
    const feedId = req.params.feedId;

    let exitCallback = function(){
         res.json({message: "Could not retrieve episodes", messageType: "warning"});
    }
    Feed.findById(feedId, function(err, feed){
        console.log(feed)
        if(err){
                exitCallback();
            }
        User.findById(userId, function(err, user){
            console.log(user)
            if(err){
                exitCallback();
            }
            User.GetEpisodes(user, feed, exitCallback, function(feed, episodes){
                console.log(episodes)
                res.json({message: feed.title + " episode data for " + user.username, 
                    messageType: "success",
                    feed: feed,
                    episodes: episodes
                })
            });
        });
    });
});

router.post('/feeds/unsubscribe/:feedId', function(req, res){
    const userId = req.body.userId;
    const feedId = req.params.feedId;

    let exitCallback = function(messageType, message){
        res.json({message: message, messageType: messageType});
    }


    User.findById(userId, function(err, user){
        if(err){
            exitCallback('warning', 'Error unsubscribing feed');
        }

        
        Feed.Unsubscribe(user, feedId, exitCallback);

    });
});

module.exports = router;

/*

-user
    -get
        getAllFeeds
        /feeds/

        getFeed
        /feeds/:id

        getEpisode
        /epidoses/:id

        getAllEpisodes
        /episodes/allForUser

        last10Updated
        /episodes/last10Updated
    -post
        subscribeToFeed
        /feeds/subscribe/:id
        
        unsubscribeToFeed
        /feeds/unsubscribe/:id

        mark

-generic
    -get
        getTopFeeds
        /topFeeds

        getTopEpisodes
        /topEpisodes
    -post


*/