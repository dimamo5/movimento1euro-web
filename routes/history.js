/**
 * Created by diogo on 30/11/2016.
 */
const express = require('express');
const db = require('../database/database');
const api = require('../database/api_wrapper');
const router = express.Router();

/* GET Template listing. */
router.get('/', (req, res) => {
    res.render('history', {historyPage: true});
});

router.get('/api/messages', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
    } else {
        db.Message.findAll({where : msg_type != 'Alert' }).then((messages) => {
            res.json({result: 'success', messages: messages});
        })
    }
});

module.exports = router;
