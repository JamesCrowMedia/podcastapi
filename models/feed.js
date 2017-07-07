const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let feedSchema = Schema({
    title: { type: String, required: true }, //<title>
    feedURL: { type: String, required: true }, //
    siteLink: { type: String, required: true }, //<link>
    imgURL: { type: String, required: true }, //
    description: { type: {String} }, //<description>
    owner: { type: {String} }, //<itunes:author>
    language: { type: String}, //<language>
    //explicit: { type: String}, //<itunes:explicit>yes
    categories: {type: [String] }, 
    // lastUpdate: { type: String},
    // Refreshed: { type: String},
    // lastActivity: { type: String},
    // episodes: { type: String},
    subscribers: 0,
    plays: 0, 


},
{
    collection: "feeds"

});

module.exports = mongoose.model('Feed', feedSchema);