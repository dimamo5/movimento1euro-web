var express = require('express');
var db = require('../database/database.js');
var apiWrapper = require('../database/api_wrapper');
var router = express.Router();

router.get('/login', function (req, res) {
    if(req.body.mail && req.body.password){
        apiWrapper.getUser(mail,password,function(result){
                if(result){
                    db.mobileAppUsers.findOne({where:{
                        external_link_id:result.id
                    }}).then(function(result){
                        res.json({token:result.token});
                    })
                }else{
                    res.status(401).end();
                }
            });
    }
});