const express = require('express');
const db = require('../database/database');
const api = require('../database/api_wrapper');
const router = express.Router();

/* GET Messages listing. */
router.get('/', (req, res) => {
    res.render('history', {historyPage: true});
});

router.get('/api/messages', (req, res) => {
    db.Message.findAll()
        .then((messages) => {
            res.json(messages);
        })
        .catch(() => {
            res.status(404).end();
        })
});

router.get('/api/messages/:id',(req,res)=>{
    db.Message.findOne({where:{id:req.params.id}})
        .then((message)=>{
            return message.getAppUsers();
        })
        .then((users)=>{
            res.json(users)
        })
        .catch(()=>{
            res.status(400).end()
        })
});

module.exports = router;
