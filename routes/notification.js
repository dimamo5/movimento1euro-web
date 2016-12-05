const request = require('request');
const express = require('express');
const async = require('async');
const db = require('../database/database');
const _ = require('lodash');
var api = require("../database/api_wrapper.js");

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

function parseTemplate(message, user) {
    return message.replace('@nome', user.name).replace('@proxPagamento', user.nextPayment.toLocaleString())
}

/* Ids.length >= 1  */
function sendTemplateMessageUser(user, template_content, template_title, results, messageGlobal, callback) {
    console.log('Processing notification to user #' + user.id);

    let parsed_content = parseTemplate(template_content, user.wpUser); // parse i

    //clone object because async is the thing
    let options_request = JSON.parse(JSON.stringify(options));

    console.log("firebase id: " + user.firebase_token);

    options_request.body.to = user.firebase_token;
    options_request.body.notification = {title: template_title, body: parsed_content};

    request(options_request, (error, response, body) => {
        if (!error && response.statusCode == 200 && body.failure == 0) {
            if (!body.results.error) {
                results.push(body.results[0]);
                messageGlobal.setAppUsers([user], {
                    firebaseMsgID: body.results[0].message_id,
                    content: parsed_content,
                    sent: true
                });
            }
            else { //erro na msg
                messageGlobal.setAppUsers([user], {
                    firebaseMsgID: body.results[0].message_id,
                    content: parsed_content,
                    sent: false
                });
            }
            callback();
        } else {
            callback(error);
        }
    });
}
function sendTemplateMessage(req, res) {
    let template_id = req.body.templateId;
    let template_content, template_title;
    let msg_type = 'Template';
    let ids = req.body.ids;
    let results = [];
    let messageGlobal;

    //get template from template_id of the post request
    db.Template.findOne({
        where: {id: template_id}
    }).then(function (template) {
        template_content = template.content;
        template_title = template.name;
        return db.Message.create({
            msg_type: msg_type,
            date: Date.now()
        }).then((message) => {
            messageGlobal = _.cloneDeep(message);
            return template.setMessages([message]);
        })
    }).then(() => {
        return api.getUsersInfoIds(ids)
    }).then((users) => {
        async.each(users, function (user, callback) {
            sendTemplateMessageUser(user, template_content, template_title, results, messageGlobal, callback);
        });
    }, function (err) {
        // if any of the notification processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            console.log('Failed to async process. Erro:' + err);
        } else {
            res.json({
                result: 'success',
                notificationStates: results,
            });
            console.log('All notifications have been processed successfully');
        }
    });
}
router.post('/sendTemplate', (req, res) => {
    if (!(req.body.ids && req.body.templateId)) {
        res.json({error: 'Wrong params'});
        return;
    }
    sendTemplateMessage(req, res);
});

/* Ids.length >= 1  */
router.post('/sendManual', (req, res) => {
    if (!(req.body.ids && req.body.title && req.body.content)) {
        res.json({error: 'Wrong params'});
        return;
    }

    let title = req.body.title;
    let content = req.body.content;
    let msg_type = 'Manual';
    let ids = req.body.ids;

    db.AppUser.findAll({
        where: {id: ids},
        attributes: ['firebase_token']
    }).then(function (reg_ids) {

        var firebase_ids = [];

        for (let reg_id of reg_ids) {
            firebase_ids.push(reg_id.firebase_token);
        }

        options.body.registration_ids = firebase_ids;
        options.body.notification = {title: title, body: content};

        db.Message.create({
            msg_type: msg_type,
            content: content,
            title: title,
            date: new Date(),
        }).then(function (message) {
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
                    console.log(error, response);
                }
            });
        });

    }).catch(function (err) {
            console.log("Não encontrou utilizador na base de dados", err);
        }
    );

});


module.exports = router;
module.exports.sendTemplateMessageUser = sendTemplateMessageUser;