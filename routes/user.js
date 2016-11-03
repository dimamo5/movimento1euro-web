var express = require('express');
var db = require('../database/database');
var api =require('../database/api_wrapper')
var router = express.Router();

/* GET Template listing. */
router.get('/', function (req, res) {
    res.render('user', {usersPage: true});
});

router.get('/api/users', function (req, res) {
    api.getUsersInfo()
        .then((users)=>{
            res.json(users);
        })
});

module.exports=router;