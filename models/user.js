const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserFeedEp = require('./userFeedEpisode');
const Feed = require('./feed');
const Episode = require('./episode');



let userSchema = Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    feeds: { type: [Schema.Types.ObjectId], default: [] },
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

module.exports.LinkUserToEpisode = function(user, feed, episode){
    let newUserFeedEp = new UserFeedEp();
    newUserFeedEp.user = user;
    newUserFeedEp.feed = feed;
    newUserFeedEp.episode = episode;

    newUserFeedEp.save(function(err){
        if(err){
            console.log(err);
        };  
    });
};