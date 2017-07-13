const express = require('express');
const router = express.Router();

let Feed = require('../models/feed');
let Episode = require('../models/episode');

router.get('/', function(req, res){
    
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