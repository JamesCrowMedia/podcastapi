const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userFeedEpSchema = Schema({
    user: { type: Schema.Types.ObjectId, required: true },
    feed: { type: Schema.Types.ObjectId, required: true },
    episode: { type: Schema.Types.ObjectId, required: true },
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