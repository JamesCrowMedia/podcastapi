const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserFeedEp = require('./userFeedEpisode');
const Feed = require('./feed');
let User = require('./user');

let episodeSchema = Schema({
    feed: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    title: { type: String, required: true }, 
    published: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    duration: { type: String, default: 'Unknown' },
    guid: { type: String, default: '' },
    file: {
        filesize: { type: String, default: 'Unknown' },
        type: { type: String, default: 'Unknown' },
        url: { type: String, required: true }
    }, 
    created: { type: Date, default: Date.now },
    linkLastGood: { type: Date, default: Date.now },
    plays: { type: Number, default: 0 }
},
{
    collection: "episodes"

});

let Episode = module.exports = mongoose.model('Episode', episodeSchema, 'episodes');

module.exports.AddEpisodes = function(episodes, feed, userId, callback){
    Episode.find({feed: feed}).distinct('file.url', function(err, urls){
        episodes.forEach(function(episode) {
            if(episode.enclosure.url && !urls.includes(episode.enclosure.url)){
                Episode.AddEpisode(episode, feed, userId);
            } else {
                console.log('Did not add' + episode.enclosure.url);
            };
        });
    });
};

module.exports.AddEpisode = function(episode, feed, userId){
    let newEpisode = new Episode();
    newEpisode.feed = feed;
    newEpisode.title = episode.title;
    newEpisode.published = episode.published;
    newEpisode.description = episode.description;
    newEpisode.duration = episode.duration;
    newEpisode.guid = episode.guid;
    newEpisode.file.filesize = episode.enclosure.filesize;
    newEpisode.file.type = episode.enclosure.type;
    newEpisode.file.url = episode.enclosure.url;

    newEpisode.save(function(err){
        console.log('Added ' + newEpisode.file.url);
        if(err){
         console.log('error');   
        };
        let User = require('./user');
        User.GetUser(userId, function(user){
            User.LinkUserToEpisode(user, feed, newEpisode);
        });
    });
};

// module.exports.GetAllEpisodes = function(feedId, callback){
//     Episodes.find()
// }
/*
{
    "title": "FooBar Episode",
    "published": "Date",
    "description": "",
    "duration": 0000,
    "guid": "3eee2c58-affc-11e6-892a-5fb47f3624d2",
    "file": {
        "filesize": "100mb",
        "type": "Audio",
         "url": "www.foo.com"
    }    
    "created": "Date",
    "plays": 0,
    "linkLastGood": "Date"
} */