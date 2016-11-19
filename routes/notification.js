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

function parseTemplate(message, users) {
    let messages = [];
    for (let i = 0; i < users.length; i++) {
        messages.push(message.replace('@nome', users.name).replace('@proxPagamento', users.nextPayment)
            .replace('@nomeCausa', 'TODO').replace('@descricaoCausa', 'TODO'));
    }
    return messages;
}

/* Ids.length >= 1  */
function sendTemplate(ids, title, content, next) {
    if (!next || typeof next != 'function' && ids.constructor === Array) {
        throw new Error('1º argument must be an array function and 4º must be a callback function');
    }

    //SEE sendManual to example

    async.each(ids, function (id, callback) {

        // Perform operation on file here.
        console.log('Processing file ' + file);

        db.WpUser.findAll({
            where: {id: ids}
        }).then(function (users) {


            options.body.to = id;
            options.body.notification = {title, body: content};


            parseTemplate(message, users)

            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    callback(null, true);
                } else {
                    var error = new Error(`${response.getActual}body`);
                    callback(error, false);
                }
            });
        }, function (err) {
            // if any of the notification processing produced an error, err would equal that error
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A notification failed to process');
            } else {
                console.log('All notifications have been processed successfully');
            }
        });
    })
}

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