/**
 * Routes to the user page in the notification backoffice
 */
const express = require('express');
const db = require('../database/database');
const api = require('../database/api_wrapper');
const router = express.Router();

/* GET Template listing. */
router.get('/', (req, res) => {
    res.render('user', {usersPage: true});
});

router.get('/api/users', (req, res) => {
    api.getUsersInfo()
        .then((users) => {
            res.json(users);
        });
});

module.exports = router;
