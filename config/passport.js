const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const secret = require('../secrets/app_SECRET');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    console.log('Passport file: start');
    passport.use(new LocalStrategy(function(username, password, done){
        let query = {username:username};
        User.findOne(query, function(err, user){
            console.log('Passport file: user query');
            if(err){
                throw err;
            };

            console.log('Passport file: user compare');
            if(!user){
                return done(null, false, {message: 'No user found'})
            };

            bcrypt.compare(password, user.password, function(err, isMatch){
                if(err){
                    throw err;
                };

                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Wrong password'})
                };
            });
        });
    }));

    passport.serializeUser(function(user, done) {
    done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};