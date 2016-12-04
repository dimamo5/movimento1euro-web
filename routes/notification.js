const request = require('request');
const express = require('express');
const async = require('async');
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

    message.replace('@nome', user.name).replace('@proxPagamento', user.nextPayment)
        .replace('@nomeCausa', 'TODO').replace('@descricaoCausa', 'TODO');

    //acesso à base de dados das causas

    return message;
}


/* Ids.length >= 1  */
router.post('/sendTemplate', (req, res) => {
    if (!(req.body.ids && req.body.templateId)) {
        res.json({error: 'Wrong params'});
        return;
    }

    var template_id = req.body.templateId;
    var template_content, template_title;
    var msg_type = 'Template';
    var ids = req.body.ids;
    var results = [];

    //get template from template_id of the post request
    var content = db.Template.findOne({
        where: {id: template_id},
        attributes: ['name', 'content'],
    }).then(function (template) {
        template_content = template.content;
        template_title = template.name;

        async.each(ids, function (id, callback) {
            console.log('Processing notification to user #' + id);



            db.AppUser.findOne({
                where: {id: id},
                attributes: ['firebase_token']
            }).then(function (reg_id) {

                var firebase_id = reg_id.firebase_token;
                var parsed_content = parseTemplate(template_content, id);

                //clone object because async is the thing
                let options_request=JSON.parse(JSON.stringify(options));

                console.log("firebase id: " + firebase_id);

                options_request.body.to = firebase_id;
                options_request.body.notification = {title:template_title, body: parsed_content};

                db.Message.create({
                    msg_type: msg_type,
                    content: parsed_content,
                    title: template_title,
                    date: new Date(),
                }).then(function (message) {
                    request(options_request, (error, response, body) => {
                        if (!error && response.statusCode == 200 && body.failure == 0) {

                            if (!body.results.error) {
                                results.push( body.results[0] );
                                message.addAppUser(id, {firebaseMsgID: body.results[0].message_id,sent:true});
                            }
                            else { //erro na msg
                                console.log(body.results[0].error);
                            }

                            callback();

                        } else {
                           callback(error);
                        }
                    });
                });
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
    });
});

/* Ids.length >= 1  */
router.post('/sendManual', (req, res) => {
    if (!(req.body.ids && req.body.title && req.body.content)) {
        res.json({error: 'Wrong params'});
        return;
    }

    var title = req.body.title;
    var content = req.body.content;
    var msg_type = 'Manual';
    var ids = req.body.ids;

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
        })
            .then(function (message) {
                request(options, (error, response, body) => {
                    if (!error && response.statusCode == 200 && body.failure == 0) {

                        for (let i = 0; i < body.results.length; i++) {
                            if (!body.results[i].error) {
                                message.addAppUser(ids[i], {firebaseMsgID: body.results[i].message_id,sent:true});
                                //TODO verificar se query não dá erro. Usar 'async.each' para isso
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