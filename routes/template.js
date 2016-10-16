/**
 * Created by diogo on 16/10/2016.
 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('template',{title:'Template'});
});

module.exports = router;