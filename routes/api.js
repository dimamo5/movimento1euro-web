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
 * @api {get} /api/logout:id Logout
 * @apiDescription Logout user by disabling his token and no future calls can be made by that token
 * @apiName Logout
 * @apiGroup Authentication
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {Number} id User Id
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
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
                res.json({result: 'error'})
            }
        })
});

module.exports = router;