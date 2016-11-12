/**
 * Created by diogo on 16/10/2016.
 */

const express = require('express');
const db = require('../database/database');
const router = express.Router();

/* GET Template listing. */
router.get('/', (req, res, next) => {
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
router.get('/api', (req, res) => {
    db.Template.findAll().then((allTemplates) => {
        res.json({result: 'success', templates: allTemplates});
    });
});


router.delete('/api/:id', (req, res) => {
    db.Template.destroy({where: {id: req.params.id}})
        .then((numRows) => {
            if (numRows > 0) {
                res.status(200);
                res.json({removed: req.params.id});
            } else {
                res.status(500).end();
            }
        }).catch(() => {
        res.status(500).end();
    });
});

/* CREATE function*/
router.put('/api/', (req, res) => {
    db.Template.create({name: req.body.name, content: req.body.content})
        .then((sucess) => {
            if (sucess) {
                res.status(200);
                res.json({result: 'success', newTemplate: sucess.dataValues});
            }
        })
        .catch(() => {
            res.status(500);
            res.json({result: 'error'});
        });
})
;
// CREATE function
router.put('/api/:id', (req, res) => {
    db.Template.upsert({name: req.body.name, content: req.body.content})
        .then((sucess) => {
            if (sucess) {
                res.status(200).end();
            } else {
                res.status(500).end();
            }
        })
        .catch(() => {
            res.status(500).end();
        });
});

module.exports = router;
