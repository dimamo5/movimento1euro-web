var express = require('express');
var db = require('../database/database.js');
var apiWrapper = require('../database/api_wrapper');
var crypto = require('crypto');
var router = express.Router();

router.get('/login', function (req, res) {
    if (req.body.mail && req.body.password) {
        apiWrapper.getUser(req.body.mail, req.body.password, function (result) {
            if (result) {
                db.mobileAppUsers.findOne({
                    where: {
                        external_link_id: result.id
                    }
                }).then(function (result) {
                        if (result.token) {
                            res.json({result: 'success', token: result.token, id: id, name: result.name});
                        }
                        else {
                            crypto.randomBytes(48, function (err, buffer) {
                                var token = buffer.toString('hex');
                            });
                        }
                    }
                )
            } else {
                res.json({result: 'login failed'});
            }
        });
    } else {
        res.json({result: 'wrong params'});
    }
})
;

router.get('/logout/:id', function (req, res) {
    db.mobileAppUsers.update({token: null},
        {where: {id: req.params.id, token: req.body.token}})
        .then(function (results) {
            if (results[0] > 0) {
                res.json({result: 'success'});
            } else {
                res.json({result: 'error login out'})
            }
        })
});