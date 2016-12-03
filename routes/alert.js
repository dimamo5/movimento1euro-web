/**
 * Created by inesa on 02/12/2016.
 */
const express = require('express');
const db = require('../database/database');
const router = express.Router();

/* GET Alert listing. */
router.get('/', (req, res, next) => {
    res.render('alert', { templatesPage: false });
});

module.exports = router;