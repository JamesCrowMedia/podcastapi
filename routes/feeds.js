// Route requests
const express = require('express');
const router = express.Router();
// Convert RSS data to JSON
const request = require('request');
const parsePodcast = require('node-podcast-parser');

let Feed = require('../models/feed');
let User = require('../models/user');
let Episode = require('../models/episode');

router.get('/', function(req, res){
    Feed.find({}, function(err, feeds){
    if(err){
      console.log(err);
    } else {
      res.render('./feeds/viewFeeds', {
        title:'Podcasts',
        feeds: feeds
      });
    }
  });
});

router.get('/add', function(req, res){
    res.render('./forms/addfeed');
});

router.post('/add', function(req, res){
    let mainRes = res;
    let url = req.body.feedURL;
    let userId = req.user._id;
    req.check('feedURL', 'URL is required').notEmpty().isURL();

    let errors = req.validationErrors(mapped=true);

     if(errors){
        console.log('Invalid URL');
        req.flash('warning', 'Invalid URL');
        mainRes.redirect('/');
    };

    // TODO: Refactor with promises
    Feed.find({ 'feedURL': req.body.feedURL }, function(err, oldFeed){

        if(err){
            console.log('Feed add error');
            req.flash('warning', 'Something went wrong');
            mainRes.redirect('/feeds');
        };


        if(oldFeed.length === 0){
            Feed.ParseFeed(req.body.feedURL, err, req, mainRes, function(data){
                Feed.AddFeed(data, req.body.feedURL, userId, function(err){
                    if(err){
                        console.log('Save Error', err);
                        req.flash('warning', 'Unable to save feed to database');
                        mainRes.redirect('/feeds');
                        return;
                    } else {
                        req.flash('success', 'New feed added to database.');
                        console.log(res.flash);
                        mainRes.redirect('/feeds');
                    };
                });
            });
        } else {
            Feed.UpdateFeed(url, err, req, mainRes, userId, function(){
                req.flash('success', 'User subscribed to feed');
                mainRes.redirect('/feeds');
            });
        };
    }); 
    
});

module.exports = router;



/*
request(req.body.feedURL, (err, res, data) => {
        if (err) {
            console.error('Network error', err);
            req.flash('warning', 'Could not retrieve feed');
            mainRes.redirect('/feeds');
            return;
        };
        
        parsePodcast(data, (err, data) => {
            if (err) {
                console.error('Parsing error', err);
                req.flash('warning', 'Invalid feed data');
                mainRes.redirect('/feeds');
                return;
            };

            console.log('Title test print 1', data.title);
            
            let newFeed = new Feed();
            console.log('Created a new feed');
            newFeed.title = data.title;
            newFeed.feedURL = req.body.feedURL;
            newFeed.siteLink = data.link;
            newFeed.imgURL = data.image;
            newFeed.description = data.description;
            newFeed.language = data.language;
            newFeed.categories = data.categories;
            newFeed.owner = data.owner;

            console.log('Print Feed', newFeed);

            newFeed.save(function(err){
                if(err){
                    console.log('Save Error', err);
                    req.flash('warning', 'Unable to save feed to database');
                    mainRes.redirect('/feeds');
                    return;
                } else {
                    req.flash('success', 'New feed added to database.');
                    console.log(res.flash);
                    mainRes.redirect('/feeds');
                };

            });
        });
    });
*/