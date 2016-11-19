const request = require('request');
const express = require('express');
const db = require('../database/database');
const router = express.Router();


const SERVER_KEY = 'AAAALZIxNV4:APA91bHeFeC9pbrVzkLR5mm2SPTOZ5QqtcaDqZMQHBOWI1T9UM2oXG0deI6E9PxYMGy4ZmRwxYGoVcI9ySjLGOkSzDXf2cMGhQZCwwcAuJm16H-lO9u7emKw5uBRhO3ykHuj1aEc-fPaNx5L9kTNkEDVFT510iVGiw';

const options = {
    method: 'POST',
    uri: 'https://fcm.googleapis.com/fcm/send',
    headers: {
        Authorization: `key=${SERVER_KEY}`,
    },
    json: true,
    body: {
        notification: {
            title: 'Titulo',
            body: 'Corpo',
        },
    },
};


/*
 function parseTemplate(message, users) {
 let messages = [];
 for (let i = 0; i < users.length; i++) {
 messages.push(message.replace('@nome', users[i].name).replace('@proxPagamento', users[i].nextPayment)
 .replace('@nomeCausa', 'TODO').replace('@descricaoCausa', 'TODO'));
 }
 return messages;
 }*/

//TODO finish this method - replace "TODO" fields
function parseTemplate(message, user) {
    let message;

    message.replace('@nome', users.name).replace('@proxPagamento', user.nextPayment)
        .replace('@nomeCausa', 'TODO').replace('@descricaoCausa', 'TODO');

    //acesso à base de dados das causas

    return message;
}


/* Ids.length >= 1  */
router.post('/sendTemplate', (req, res) => {
    if (!(req.body.ids && req.body.title && req.body.content && req.body.msg_type)) {
        res.json({error: 'Wrong params'});
        return;
    }

    var title = req.body.title;
    var content = req.body.content;
    var msg_type = req.body.msg_type;
    var ids = req.body.ids;

    async.each(ids, function (id, callback) {

        console.log('Processing notification to user #' + id);

        db.WpUser.findOne({
            where: {id: id},
            attributes: ['firebase_token']
        }).then(function (reg_id) {

            let firebase_id = reg_id.firebase_token;
            let parsed_content = parseTemplate(content, id);

            options.body.to = id;
            options.body.notification = {title, body: parsed_content};

            db.Message.create({
                msg_type: msg_type,
                content: parsed_content,
                title: title,
                date: new Date(),
            }).then(function () {
                request(options, (error, response, body) => {
                    if (!error && response.statusCode == 200 && body.failure == 0) {

                        if (!body.results.error) {
                            message.addAppUser(id, {firebaseMsgID: body.results[0].message_id});
                        }
                        else { //erro na msg
                            console.log(body.results[0].error);
                        }

                        res.json({
                            result: 'success',
                            user: id,
                            msg_id: message.id,
                            notificationStates: body.results[0],
                        });
                    } else {
                        res.json({result: 'Error processing notification'});
                    }
                });
            });
        });
    });
});

/* Ids.length >= 1  */
router.post('/sendManual', (req, res) => {
    if (!(req.body.ids && req.body.title && req.body.content && req.body.msg_type)) {
        res.json({error: 'Wrong params'});
        return;
    }

    var title = req.body.title;
    var content = req.body.content;
    var msg_type = req.body.msg_type;
    var ids = req.body.ids;

    db.AppUser.findAll({
        where: {id: ids},
        attributes: ['firebase_token']
    }).then(function (reg_ids) {

        var firebase_ids = [];

        for (reg_id of reg_ids) {
            firebase_ids.push(reg_id.firebase_token);
        }

        options.body.registration_ids = firebase_ids;
        options.body.notification = {title: title, body: content};

        db.Message.create({
            msg_type: msg_type,
            content: content,
            title: title,
            date: new Date(),
        })
            .then(function (message) {
                request(options, (error, response, body) => {
                    if (!error && response.statusCode == 200 && body.failure == 0) {

                        for (let i = 0; i < body.results.length; i++) {
                            if (!body.results[i].error) {
                                message.addAppUser(ids[i], {firebaseMsgID: body.results[i].message_id});
                            } else {   //erro na msg
                                console.log(body.results[i].error);
                            }
                        }
                        res.json({
                            result: 'success',
                            users: ids,
                            msg_id: message.id,
                            notificationStates: body.results,
                        });
                    } else {
                        res.json({result: 'Error processing notifications'});
                    }
                });
            });

    });

});


module.exports = router;