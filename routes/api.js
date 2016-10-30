var express = require('express');
var db = require('../database/database.js');
var apiWrapper = require('../database/api_wrapper');
var crypto = require('crypto');
var router = express.Router();

router.post('/login', function (req, res) {
    if (req.body.mail && req.body.password) {
        apiWrapper.getUser(req.body.mail, req.body.password, function (result) {
                if (result) {
                    db.AppUser.findOrCreate({
                        where: {
                            external_link_id: result.id
                        },
                        defaults: {
                            external_link_id: result.id,
                            name: result.name
                        }
                    }).spread(function (result) {
                        if (result) {
                            if (result.token) {
                                res.json({result: 'success', token: result.token, id: id, name: result.name});
                            }
                            else {
                                crypto.randomBytes(48, function (err, buffer) {
                                    var token = buffer.toString('hex');
                                    result.token = token;
                                    result.save().then(res.json({
                                        result: 'success',
                                        token: token,
                                        id: result.id,
                                        name: result.name
                                    }))
                                });
                            }
                        }
                    })
                } else {
                    res.json({result: 'login failed'});
                }
            }
        );
    }
    else {
        res.json({result: 'wrong params'});
    }
})
;

router.get('/logout/:id', function (req, res) {
    var auth = req.get("Authorization");
    if (!auth) {
        res.json({result: 'Authorization required'});
        return;
    }
    db.AppUser.update({token: null},
        {where: {id: req.params.id, token: auth}})
        .then(function (results) {
            if (results.length > 0) {
                res.json({result: 'success'});
            } else {
                res.json({result: 'error login out'})
            }
        })
});

module.exports = router;