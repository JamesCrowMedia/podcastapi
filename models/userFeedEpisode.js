const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Feed = require('./feed');
let User = require('./user');
let Episode = require('./episode');

let userFeedEpSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feed: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    episode: { type: Schema.Types.ObjectId, ref: 'Episode', required: true },
    created: { type: Date, default: Date.now },
    published: { type: String, default: Date() },
    viewTime: { type: Number, default: 0 }, // -1: Watched, 0: Unwatched
    userPlays: { type: Number, default: 0 },
    favorited: { type: Boolean, default: false },
    showOnList: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
},
{
    collection: "userfeedepisodes"

});

let UserFeedEp = module.exports = mongoose.model('UserFeedEp', userFeedEpSchema, 'userfeedepisodes');