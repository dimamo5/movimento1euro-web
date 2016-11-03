const express = require('express');
const db = require('../database/database.js');
const apiWrapper = require('../database/api_wrapper');
const crypto = require('crypto');
const router = express.Router();


/**
 * @api {post} /api/login User Login
 * @apiDescription User login returns the token that must be passed in an HTTP Header in future calls to the API
 * @apiName Login
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 *
 * @apiParam {String} mail User Mail
 * @apiParam {String} password User Password
 *
 * @apiSuccess {String} result Returns success
 * @apiSuccess {String} token Token for future calls to the API
 * @apiSuccess {Number} id Id of the logged user
 * @apiSuccess {String} name Name of the logged user
 * @apiSuccess {String} expDate Date of the last payment
 *
 * @apiError {String} result Returns 'login failed' or 'wrong params'
 */
router.post('/login', (req, res) => {
  if (req.body.mail && req.body.password) {
    apiWrapper.getUser(req.body.mail, req.body.password, (wpuser) => {
      if (wpuser) {
        db.AppUser.findOrCreate({
          where: {
            external_link_id: wpuser.id,
          },
          defaults: {
            external_link_id: wpuser.id,
            name: wpuser.name,
          },
        }).spread((result) => {
          if (result) {
            if (result.token) {
              res.json({
                result: 'success',
                token: result.token,
                id: result.id,
                name: result.name,
                expDate: wpuser.lastPayment,
              });
            } else {
              crypto.randomBytes(48, (err, buffer) => {
                const token = buffer.toString('hex');
                result.token = token;
                result.save().then(res.json({
                  result: 'success',
                  token,
                  id: result.id,
                  name: result.name,
                }));
              });
            }
          }
        });
      } else {
        res.json({ result: 'login failed' });
      }
    }
        );
  } else {
    res.json({ result: 'wrong params' });
  }
});

/**
 * @api {get} /api/logout Logout
 * @apiDescription User logout by disabling his token. No future calls can be made with that token
 * @apiName Logout
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.get('/logout', (req, res) => {
  const auth = req.get('Authorization');
  if (!auth) {
    res.json({ result: 'Authorization required' });
  } else {
    db.AppUser.update({ token: null },
            { where: { token: auth } })
            .then((results) => {
              if (results.length > 0) {
                res.json({ result: 'success' });
              } else {
                res.json({ result: 'error' });
              }
            });
  }
});

/**
 * @api {get} /api/winnerCauses Past Winner Causes
 * @apiDescription Returns a string with the past winner causes
 * @apiName Past Winner Causes
 * @apiGroup Causes
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiSuccess {String} result Returns 'success'
 * @apiSuccess {Object[]} causes Array with all the causes
 * @apiSuccess {Number} causes.year Year of the cause
 * @apiSuccess {String} causes.name Name of the cause
 * @apiSuccess {String} causes.description Description of the cause
 * @apiSuccess {String} causes.month Month of the winning cause
 *
 * @apiError {String} result Returns the description of the error
 */
router.get('/winnerCauses', (req, res) => {
  const auth = req.get('Authorization');
  if (!auth) {
    res.json({ result: 'Authorization required' });
    return;
  }
  db.WpCause.findAll({
    where: {
      winner: true,
    },
  })
        .then((result) => {
          res.json({ result: 'success', causes: result });
        })
        .catch(() => {
          res.json({ result: 'error' });
        });
});

/**
 * @api {put} /api/firebaseToken Update Firebase Token
 * @apiDescription In the event of firebase returning a different token to push notifications, the mobile app should
 * notify the server that the token has changed. If this token is outdated the user will not receive notifications
 * sent by the backoffice
 * @apiName Firebase Token
 * @apiGroup Notifications
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {String} token New Firebase token
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.put('/firebaseToken', (req, res) => {
  const auth = req.get('Authorization');
  if (!auth) {
    res.json({ result: 'Authorization required' });
  } else if (!req.body.firebaseToken) {
    res.json({ result: 'Wrong params' });
  } else {
    db.AppUser.findOne({
      where: {
        token: auth,
      },
    })
            .then((result) => {
              result.set('firebase_token', req.body.firebaseToken);
              result.save()
                    .then(res.json({ result: 'success' }));
            })
            .catch(() => {
              res.json({ result: 'error' });
            });
  }
});

/**
 * @api {post} /api/voteCause/:id Votes in Cause
 * @apiDescription Votes in a specific cause in the current month
 * @apiName VoteCause
 * @apiGroup Causes
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {Number} id Id of the cause the user wishes to vote
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.post('/voteCause/:id', (req, res) => {
  let user;
  const auth = req.get('Authorization');
  if (!auth) {
    res.json({ result: 'Authorization required' });
  } else {
    db.AppUser.findOne({
      where: {
        token: auth,
      },
    }).then(user =>
               db.WpUser.findOne({
                 where: {
                   id: user.external_link_id,
                 },
               })
            )
                .then((wpUser) => {
                  user = wpUser;
                  return db.WpCause.findOne({
                    where: {
                      id: req.params.id,
                    },
                  });
                })
                .then((cause) => {
                  user.setWpCauses(cause);
                  res.json({ result: 'success' });
                })

                .catch(() => {
                  res.json({ result: 'error' });
                });
  }
}
);

/**
 * @api {get} /api/votingCauses Causes to vo\
 * @apiDescription Obtains the causes that an user can vote in the current month
 * @apiName Voting Causes
 * @apiGroup Causes
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiSuccess {String} result Returns 'success'
 * @apiSuccess {Object[]} causes Array with all the causes
 * @apiSuccess {Number} causes.id Id of the cause
 * @apiSuccess {Number} causes.year Year of the cause
 * @apiSuccess {String} causes.month Month of the winning cause
 * @apiSuccess {String} causes.name Name of the cause
 * @apiSuccess {String} causes.description Description of the cause
 * @apiSuccess {String} causes.image Link to main image of the cause
 *
 * @apiError {String} result Returns the description of the error
 */
router.get('/votingCauses', (req, res) => {
  const auth = req.get('Authorization');
  if (!auth) {
    res.json({ result: 'Authorization required' });
  } else {
    db.WpCause.findAll({
      where: {
        month: new Date().getMonth() + 1,
      },
    }
        )
            .then((causes) => {
              res.json({ result: 'success', causes });
            })
            .catch(() => {
              res.json({ result: 'error' });
            }
            );
  }
});

/**
 * @api {put} /api/notificationSeen/:notificationId Set notification as seen
 * @apiDescription Set notification as seen
 * @apiName Set Notification Seen
 * @apiGroup Notifications
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {Number} notificationId id of notification to be set as seen
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.put('/notificationSeen/:notificationId', (req, res) => {
    // TODO not a priority right now
});

module.exports = router;
