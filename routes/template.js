/**
 * Created by diogo on 16/10/2016.
 */

var express = require('express');
var db = require('../database/database.js')
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('template', {templatesPage: true, templates: db.getAllTemplates()});
});


router.delete('/:id', function (req, res) {
    db.templates.destroy({where: {id: req.body.id}})
        .then(function () {
            res.status(200).end();
        })
    .catch (function () {
        res.status(500).end();
    })

});


module.exports = router;