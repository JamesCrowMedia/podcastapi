const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Episode = require('./episode');

// Convert RSS data to JSON
const request = require('request');
const parsePodcast = require('node-podcast-parser');
var podcatcher = require('podcatcher');

// const FeedParser = require('feedparser');
const fs = require('fs');

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

module.exports.ParseFeed = function(url, exitCallback, callback){
    podcatcher.getAll(url, function(err, meta, articles) {
        if (err) {
            console.log(err);
            exitCallback('danger', "Invalid feed data");
        } else {
            console.log(meta.title);
            callback(meta, articles, url);
        }
    });
}

module.exports.AddFeed = function(meta, articles, feedURL, user, callback){

    let urlCatch = meta.xmlurl || meta.xmlUrl || feedURL;
    console.log(urlCatch);
    Feed.findOne({'feedURL': urlCatch}, function(err, feedExists){

        if(!feedExists){
            try{
                let newFeed = new Feed();
                console.log('Created a new feed');
                newFeed.title = meta.title;
                newFeed.feedURL = urlCatch;
                newFeed.siteLink = meta.link;
                newFeed.imgURL = meta.image.url;
                newFeed.description.long = meta.description;
                newFeed.language = meta.language;
                newFeed.categories = meta.categories;
                newFeed.owner.name = meta.author;

                console.log('Print Feed', newFeed);

                newFeed.save(function(err){
                    console.log('Print URL', newFeed.FeedURL);
                    if(err) throw err;
                   
                    user.feeds.push(newFeed);

                    user.save(function(err){
                        if(err) throw err;
                        callback(newFeed, articles, feedURL);
                    });
                });                

            } catch(e) {
                console.log('Feed creation failure.' + e);
            }
        } else {
            console.log('Feed already exists');
            
            user.feeds.push(feedExists);

            user.save(function(err){
                if(err) throw err;
                callback(feedExists, articles, feedURL);
            });
        }
    });

};

// module.exports.UpdateFeed = function(url, err, req, res, callback){
//     Feed.findOne({feedURL: url}, function(err, feed){
//         console.log(err);
//         Feed.ParseFeed(url, err, req, res, function(data){
//             Episode.AddEpisodes(data.episodes, feed, userId, callback(err))
//         });
//     });
// };

// TODO: Figure out why owner doesn't always parse
// TODO: Make a constructor and move code out of app.js