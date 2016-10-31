/**
 * Created by diogo on 16/10/2016.
 */

var express = require('express');
var db = require('../database/database.js')
var router = express.Router();

/* GET Template listing. */
router.get('/', function (req, res, next) {
    res.render('template', {templatesPage: true});
});

/**
 * @api {get} templates/api/ Gets all templates
 * @apiName GetAllTemplates
 * @apiGroup Templates
 * @apiHeader {Number} cookieId User must login to receive cookieID
 *
 * @apiSuccess {String} name Name of the Template
 * @apiSuccess {String} content Content of the Template
 * @apiSuccess {Number} id Id of the Template
 */
router.get('/api', function (req, res) {
    db.templates.findAll().then(function (allTemplates) {
        res.json({result: 'success', templates: allTemplates});
    })
});


router.delete('/api/:id', function (req, res) {
    db.templates.destroy({where: {id: req.params.id}})
        .then(function (numRows) {
            if (numRows > 0) {
                res.status(200);
                res.json({removed: req.params.id})
            } else {
                res.status(500).end();
            }
        }).catch(function () {
        res.status(500).end();
    })
});

/* CREATE function*/
router.put('/api/', function (req, res) {
    db.templates.upsert({name: req.body.name, content: req.body.content})
        .then(function (sucess) {
            if (sucess)
                res.status(200).end();
            else
                res.status(500).end();
        })
        .catch(function () {
            res.status(500).end();
        })
})
;
// CREATE function
router.put('/api/:id', function (req, res) {
    db.templates.upsert({name: req.body.name, content: req.body.content})
        .then(function (sucess) {
            if (sucess)
                res.status(200).end();
            else
                res.status(500).end();
        })
        .catch(function () {
            res.status(500).end();
        })
});

module.exports = router;