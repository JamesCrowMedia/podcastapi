const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Episode = require('./episode');

// Convert RSS data to JSON
const request = require('request');
const parsePodcast = require('node-podcast-parser');

let feedSchema = Schema({
    title: { type: String, required: true },
    feedURL: { type: String, required: true },
    siteLink: { type: String, required: true },
    imgURL: { type: String, required: true },
    description: {
        long: { type: String, default: '' },
        short: { type: String, default: '' }
    },
    owner: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
    },
    language: { type: String, default: '' },
    categories: {type: [String], default: ['']}, 
    lastUpdate: { type: Date, default: Date.now }, // Last new episode
    Refreshed: { type: Date, default: Date.now }, // Last episode check
    lastActivity: { type: Date, default: Date.now }, // Last play or subscription
    subscribers: { type: Number, default: 0 },
    plays: { type: Number, default: 0 }, 
},
{
    collection: "feeds"

});

let Feed = module.exports = mongoose.model('Feed', feedSchema, 'feeds');

module.exports.GetAll = function(callback){
    Feed.find({});
};

module.exports.ParseFeed = function(url, err, req, mainRes, callback){
    request(url, (err, res, data) => {
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
            
            callback(data);
        });
    });
};

module.exports.AddFeed = function(data, feedURL, userId, callback){
    let newFeed = new Feed();
    console.log('Created a new feed');
    newFeed.title = data.title;
    newFeed.feedURL = feedURL;
    newFeed.siteLink = data.link;
    newFeed.imgURL = data.image;
    newFeed.description = data.description;
    newFeed.language = data.language;
    newFeed.categories = data.categories;
    newFeed.owner = data.owner;

    console.log('Print Feed', newFeed);

    newFeed.save(function(err){
        Episode.AddEpisodes(data.episodes, newFeed, userId, callback(err));
    });
};

module.exports.UpdateFeed = function(url, err, req, res, callback){
    Feed.findOne({feedURL: url}, function(err, feed){
        console.log(err);
        Feed.ParseFeed(url, err, req, res, function(data){
            Episode.AddEpisodes(data.episodes, feed, userId, callback(err))
        });
    });
};

// TODO: Figure out why owner doesn't always parse
// TODO: Make a constructor and move code out of app.js