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
    fileType: { type: String, default: 'Unknown' },
    fileUrl: { type: String, required: true }, 
    created: { type: Date, default: Date.now },
    linkLastGood: { type: Date, default: Date.now },
    plays: { type: Number, default: 0 }
},
{
    collection: "episodes"

});

let Episode = module.exports = mongoose.model('Episode', episodeSchema, 'episodes');

module.exports.AddEpisodes = function(newFeed, articles, feedURL, exitCallback, callback){
    articles.forEach(function(episode){
        try{
            Episode.findOne({fileUrl: episode.enclosures[0].url}, function(err, episodeExists){
                
                if(!episodeExists){
                    try{
                        let newEpisode = new Episode();
                        newEpisode.feed = newFeed;
                        newEpisode.title = episode.title;
                        newEpisode.published = episode.pubdate || episode.pubDate;
                        newEpisode.description = episode.description || episode.summary;
                        newEpisode.duration = episode.enclosures[0].length;
                        newEpisode.guid = episode.guid;
                        newEpisode.fileType = episode.enclosures[0].type;
                        newEpisode.fileUrl = episode.enclosures[0].url;

                        console.log(newEpisode.fileUrl);
    
                        newEpisode.save(function(err){
                            
                            callback(newFeed, newEpisode);
                        });

                    } catch(e) {
                        console.log('Episode creation failure.');
                    }
                } else {
                    console.log('Episode already exists');
                    callback(newFeed, episodeExists);
                }
            });
            
        } catch(e) {
            console.log(episode);
        }
    });
    exitCallback('success', 'You have been subscribed to the podcast', '/feeds');
};

// module.exports.GetAllEpisodes = function(feedId, callback){
//     Episodes.find()
// }
