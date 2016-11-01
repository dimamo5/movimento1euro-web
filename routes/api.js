var express = require('express');
var db = require('../database/database.js');
var apiWrapper = require('../database/api_wrapper');
var crypto = require('crypto');
var router = express.Router();


/**
 * @api {post} /api/login Login User
 * @apiDescription Login user and retrieves information about in such as token that must be passed in a HTTP Header
 * Authentication for future calls to the API
 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiParam {String} mail User Mail
 * @apiParam {String} password User Password
 *
 * @apiSuccess {String} result Returns success
 * @apiSuccess {String} token Token for future calls to the API
 * @apiSuccess {Number} id Id of the logged user
 * @apiSuccess {String} name Name of the logged user
 *
 * @apiError {String} result Returns 'login failed' or 'wrong params'
 */
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

/**
 * @api {get} /api/logout Logout
 * @apiDescription Logout user by disabling his token and no future calls can be made by that token
 * @apiName Logout
 * @apiGroup Authentication
 * @apiHeader {String} Authorization User token
 *
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.get('/logout', function (req, res) {
    var auth = req.get("Authorization");
    if (!auth) {
        res.json({result: 'Authorization required'});
    }else {
        db.AppUser.update({token: null},
            {where: {token: auth}})
            .then(function (results) {
                if (results.length > 0) {
                    res.json({result: 'success'});
                } else {
                    res.json({result: 'error'})
                }
            })
    }
});

router.get('/winnerCauses', function (req, res) {
    var auth = req.get("Authorization");
    if (!auth) {
        res.json({result: 'Authorization required'});
        return;
    }
    db.WpCause.findAll({
        where: {
            winner: true
        }
    })
        .then(function (results) {
            res.json(results)
        })
        .catch(res.json({result: 'error'}));
});

/**
 * @api {get} /api/firebaseToken Update firebase token
 * @apiDescription In case of firebase giving a different token to push notifications, the mobile app should notify
 * the server that the token has changed
 * @apiName Firebase Token
 * @apiGroup Notifications
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {String} token New Firebase token
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.put('/firebaseToken', function (req, res) {
    var auth = req.get("Authorization");
    if (!auth) {
        res.json({result: 'Authorization required'});
    } else if (!req.body.firebaseToken) {
        res.json({result: 'Wrong params'})
    } else {
        db.WpUser.findOne({
            where: {
                token: auth
            }
        })
            .then(function (result) {
                result.firebase_token = req.body.firebaseToken;
                result.save()
                    .then(res.json({result: 'success'}));
            })
            .catch(res.json({result: 'error'}));
    }
});

router.post('/voteCause/:id', function (req, res) {
    var auth = req.get("Authorization");
    if (!auth) {
        res.json({result: 'Authorization required'});
    } else {
        db.WpUser.findOne({
            where: {
                token: auth
            }
        })
            .then(function (user) {
                return db.WpCause.findOne({
                    where: {
                        id: req.params.id
                    }
                })
                    .then(function (cause) {
                        user.setWpCauses(cause);
                    })
            })
            .catch(res.json({result: 'error'}));
    }
});

router.get('/votingCauses/', function (req, res) {
    var auth = req.get("Authorization");
    if (!auth) {
        res.json({result: 'Authorization required'});
    } else {
        //TODO Fazer esta cena
    }
});

module.exports = router;