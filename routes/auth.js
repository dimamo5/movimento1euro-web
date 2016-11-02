/**
 * Created by diogo on 17/10/2016.
 */
var express = require('express');
const crypto = require('crypto');
var db = require('../database/database.js');
var router = express.Router();

router.get('/',function(req,res){
    if (req.session.id && req.session.username) {
        res.redirect('/users');
    } else {
        res.redirect('/login');
    }
});

router.get('/login', function (req, res) {
    if (req.session.id && req.session.username) {
        res.redirect('/users');
    } else {
        res.render('login');
    }
});

router.post('/process_login', function (req, res) {
    if (req.session.id && req.session.username) {
        res.redirect('/users');
    } else if (req.body.username && req.body.password) {
        console.log(req.body.username,req.body.password);
        var username = req.body.username;
        var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
        console.log('password', password);
        db.Admin.findOne({
                where: {
                    password: password,
                    username: username
                }
            }
        ).then(function (admin) {
            if (admin) {
                req.session.id = admin.id;
                req.session.username = admin.username;
                res.redirect('/users');
            } else {
                res.redirect('/login?error=1');
            }
        }).catch(function () {
            res.status(500).end();
        })
    } else {
        res.redirect('/login');
    }
});

router.get('/logout', function (req, res) {
    if (req.session.id && req.session.username) {
        req.session.destroy(function (err) {
            console.log("Error removing session: ", err);
        });
        res.redirect('/login');
    }else{
        res.redirect('/users');
    }
});

module.exports = router;