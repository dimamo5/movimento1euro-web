/**
 * Created by diogo on 16/10/2016.
 */

var express = require('express');
var db = require('../database/database.js')
var router = express.Router();

/* GET templates listing. */
router.get('/', function (req, res, next) {
    db.templates.findAll().then(function (allTemplates) {
        res.render('template', {templatesPage: true, templates: allTemplates});
    });
});


router.delete('/:id', function (req, res) {
    db.templates.destroy({where: {id: req.params.id}})
        .then(function (numRows) {
            if (numRows > 0) {
                res.status(200).end();
            } else {
                res.status(500).end();
            }
        }).catch(function () {
        res.status(500).end();
    })
});

/* CREATE/UPDATE function*/
router.put('/',function (req, res) {
    db.templates.upsert({name: req.body.name, content: req.body.content})
        .then(function (sucess) {
            if (sucess)
                res.status(200).end();
            else
                res.status(500).end();
        })
        .catch(function(){
            res.status(500).end();
        })
});


module.exports = router;