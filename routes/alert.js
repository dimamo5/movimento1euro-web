/**
 * Created by inesa on 02/12/2016.
 */
const express = require('express');
const db = require('../database/database');
const router = express.Router();

/* GET Alert listing. */
router.get('/', (req, res, next) => {
    res.render('alert', {templatesPage: false});
});

router.get('/api/alert', (req, res) => {
    db.Alert.findOne()
        .then((alert) => {
            res.json({result: 'success', 'alert': alert});
        })
});



router.put('/api/:id', (req, res) => {
    db.Alert.update({active: req.body.active, start_alert: req.body.start_alert},
        {where: {id: req.params.id}})
        .then((sucess) => {
            if (sucess[0] == 1) {
                res.status(200);
                res.json({result: 'success'});
            }
        })
        .catch(() => {
            res.status(500);
            res.json({result: 'error'});
        });
});

module.exports = router;