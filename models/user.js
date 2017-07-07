const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = Schema({
    email: { type: String, required: true },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    //feeds: [Schema.Types.ObjectId],
    //created: { type: Date, default: Date.now },
    //lastActivity: { type: Date, default: Date.now },
    isAdmin: Boolean
    //privateKey: hash of publicKey
    //publicKey: random key
},
{
    collection: "users"

});

module.exports = mongoose.model('User', userSchema);