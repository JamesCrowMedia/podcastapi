const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

let user = require('../models/user');

router.get('/', function(req, res){

});

router.get('/login', function(req, res){
    console.log('get: /user/login');
    res.render('./user/login', {
        username: ''
    });
});

//TODO: Pass username back into view
router.post('/login', function(req, res, next){
    console.log('post: /user/login');
    passport.authenticate('local', {
        successRedirect: '/feeds',
        failureRedirect: '/user/login',
        failureFlash: true,
        successFlash: req.body.username + ' successfully logged in',
        badRequestMessage: ('You need both an email and a password')
    })(req, res, next);
});

router.get('/logout', function(req, res){
    req.logOut();
    req.flash('success', 'User logged out');
    res.redirect('/');
});

router.get('/signup', function(req, res){
    console.log('get: /uers/signup')
    res.render('./user/signup', {
                username: ''
            });
});

router.post('/signup', function(req, res){
    console.log('post: /uers/signup')

    let username = req.body.username;
    let password = req.body.password;
    let verify = req.body.verify;

    
    req.checkBody('username', 'A valid email is required').isEmail();
    req.checkBody('password', 'A valid password is required').notEmpty();
    req.checkBody('verify', 'Passwords do not match').equals(password);

    req.getValidationResult().then(function(errors) {
        if(!errors.isEmpty()){
            errors.array().forEach(function(error) {
                req.flash('warning', error.msg);
            });
                
            res.render('./user/signup', {
                username: username
            });
        } else {
            let usersalt = ''
            let hashed_password = ''
            
            bcrypt.genSalt(10, function(err, salt){

                usersalt = salt;

                bcrypt.hash(password, salt, function(err, hash){
                    if(err){
                        console.log(err);
                    };

                    hashed_password = hash;

                    let newUser= new user({
                        username: username,
                        password: hashed_password,
                        salt: usersalt,
                    });

                    newUser.save(function(err){
                        if(err){
                            console.log(err);
                        } else {
                            req.flash('success', 'User ' + newUser.username + ' was successfully created.');
                            res.redirect('/user/login');
                        };
                    });
                });
            });
        };
    });
});  

module.exports = router;