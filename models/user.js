const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserFeedEp = require('./userFeedEpisode');
const Feed = require('./feed');
const Episode = require('./episode');



let userSchema = Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    feeds: { type: [{ type: Schema.Types.ObjectId, ref: 'Feed'}], default: [] },
    created: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false },
    publicKey: String,
    privateKey: String
},
{
    collection: "users"

});

let User = module.exports = mongoose.model('User', userSchema, 'users');

module.exports.GetUser = function(userId, callback){
    User.findOne({_id: userId}, function(err, user){
        if(err){
            console.log(err);
        }
        callback(user);
    });
};

module.exports.LinkUserToEpisode = function(feed, episode, user){
    
    UserFeedEp.findOne({ user: user, episode: episode }, function(err, linkExists){
        if(!linkExists){

            let newUserFeedEp = new UserFeedEp();
            newUserFeedEp.user = user;
            newUserFeedEp.feed = feed;
            newUserFeedEp.episode = episode;
            newUserFeedEp.published = Date.parse(episode.published);


            console.log('newUserFeedEp _id: '+newUserFeedEp.id);
            newUserFeedEp.save(function(err){
                if(err){
                    console.log("Link error", err);
                };  
            });
        } else {
                console.log('Link already exists')
        }
    });
};

module.exports.GetEpisodes = function(user, feed, exitCallback, callback){
    UserFeedEp.find({ user: user, feed: feed })
        .sort( {'published': -1} )
        .populate('episode')
        .exec(function(err, episodes){
            if(err){
                exitCallback('warning', 'Unable to find episodes', '/feeds');
            }

        if(episodes){
            callback(feed, episodes);
        } else {
            exitCallback('warning', 'Unable to find episodes', '/feeds');
        }
    });
}