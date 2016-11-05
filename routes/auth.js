/**
 * Created by diogo on 17/10/2016.
 */
const express = require('express');
const crypto = require('crypto');
const db = require('../database/database.js');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.id && req.session.username) {
    res.redirect('/user');
  } else {
    res.redirect('/login');
  }
});

router.get('/login', (req, res) => {
  if (req.session.id && req.session.username) {
    res.redirect('/user');
  } else {
    res.render('login');
  }
});

router.post('/process_login', (req, res) => {
  if (req.session.id && req.session.username) {
    res.redirect('/user');
  } else if (req.body.username && req.body.password) {
    console.log(req.body.username, req.body.password);
    const username = req.body.username;
    const password = crypto.createHash('sha256').update(req.body.password).digest('hex');
    console.log('password', password);
    db.Admin.findOne({
      where: {
        password,
        username,
      },
    }
        ).then((admin) => {
          if (admin) {
            req.session.id = admin.id;
            req.session.username = admin.username;
            res.redirect('/user');
          } else {
            res.redirect('/login?error=1');
          }
        }).catch(() => {
          res.status(500).end();
        });
  } else {
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  if (req.session.id && req.session.username) {
    req.session.destroy((err) => {
      console.log('Error removing session: ', err);
    });
    res.redirect('/login');
  } else {
    res.redirect('/user');
  }
});

module.exports = router;
