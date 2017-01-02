const express = require('express');
const db = require('../database/database.js');
const apiWrapper = require('../database/api_wrapper');
const crypto = require('crypto');
const router = express.Router();
const request = require('request');
const async = require('async');

const M1E_URL = 'https://movimento1euro.pdmfc.com/wp-admin/admin-ajax.php';


/**
 * @api {post} /api/login User Login
 * @apiDescription User login returns the token that must be passed in an HTTP Header in future calls to the API
 * @apiName Login
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 *
 * @apiParam {String} mail User Mail
 * @apiParam {String} password User Password
 *
 * @apiSuccess {String} result Returns success
 * @apiSuccess {String} token Token for future calls to the API
 * @apiSuccess {Number} id Id of the logged user
 * @apiSuccess {String} name Name of the logged user
 * @apiSuccess {String} expDate Date of the last payment
 *
 * @apiError {String} result Returns 'login failed' or 'wrong params'
 */
router.post('/login', (req, res) => {
    if (req.body.mail && req.body.password) {
        apiWrapper.getUser(req.body.mail, req.body.password, (wpuser) => {
                if (wpuser) {
                    db.AppUser.findOrCreate({
                        where: {
                            external_link_id: wpuser.id,
                        },
                        defaults: {
                            external_link_id: wpuser.id,
                            name: wpuser.name,
                        },
                    }).spread((result) => {
                        if (result) {
                            if (result.token) {
                                res.json({
                                    result: 'success',
                                    token: result.token,
                                    id: result.id,
                                    name: result.name,
                                    expDate: wpuser.nextPayment
                                });
                            } else {
                                crypto.randomBytes(48, (err, buffer) => {
                                    const token = buffer.toString('hex');
                                    result.token = token;
                                    result.save().then(() => res.json({
                                        result: 'success',
                                        token,
                                        id: result.id,
                                        name: result.name,
                                        expDate: wpuser.nextPayment
                                    }));
                                });
                            }
                        }
                    });
                } else {
                    res.json({result: 'login failed'});
                }
            }
        );
    } else {
        res.json({result: 'wrong params'});
    }
});

router.get('/refresh', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.status(401);
        res.json({result: 'Authorization required'});
        return;
    }
    let appUserTemp;
    db.AppUser.findOne({where: {token: auth}})
        .then((appUser) => {
            appUserTemp = appUser;
            return db.WpUser.findOne({
                where: {
                    id: appUser.external_link_id,
                }
            })
        })
        .catch(() => {
            res.status(401);
            res.json({result: 'Not Authorized'});
        })
        .then((wpUser) => {
            res.json({
                result: 'success',
                token: appUserTemp.token,
                id: appUserTemp.id,
                name: wpUser.name,
                expDate: wpUser.nextPayment
            });
        })
        .catch(() => {
            res.json({result: "Error"})
        })
});

/**
 * @api {get} /api/loginFB Verify FB login
 * @apiDescription Verify login token/id through facebook API, returns token and user info
 * @apiName LoginFB
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {String} token User's facebook access token
 * @apiParam {String} id User's facebook id
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.post('/loginfb', (req, res) => {
    if (req.body.token && req.body.id) {
        apiWrapper.getUserFB(req.body.id, function (error, user) {
            if (error) {
                res.json({result: error});
            }
            else {
                request.get('https://graph.facebook.com/v2.8/me?fields=id&access_token=' + req.body.token,
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var bodyJson = JSON.parse(body);
                            var idFacebook = parseInt(bodyJson.id);
                            if (req.body.id == idFacebook) {
                                if (user.appUser.token) {
                                    res.json({
                                        result: 'success',
                                        token: user.appUser.token,
                                        id: user.appUser.id,
                                        name: user.appUser.name,
                                        expDate: user.wpUser.nextPayment
                                    });
                                } else {
                                    crypto.randomBytes(48, (err, buffer) => {
                                        const token = buffer.toString('hex');
                                        user.appUser.token = token;
                                        user.appUser.save()
                                            .then(() => res.json({
                                                result: 'success',
                                                token: token,
                                                id: user.appUser.id,
                                                name: user.appUser.name,
                                                expDate: user.wpUser.nextPayment
                                            }))
                                            .catch((err) => {
                                                res.json({result: err});
                                            })
                                    });
                                }
                            }
                            else {
                                res.json({result: 'IDs dont match.'});
                            }
                        }
                        else {
                            res.json({result: 'FB API call error'})
                        }
                    })
            }
        })

    }
});


/**
 * @api {get} /api/logout Logout
 * @apiDescription User logout by disabling his token. No future calls can be made with that token
 * @apiName Logout
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.get('/logout', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
    } else {
        db.AppUser.update({token: null},
            {where: {token: auth}})
            .then((results) => {
                if (results.length > 0) {
                    res.json({result: 'success'});
                } else {
                    res.json({result: 'error'});
                }
            });
    }
});

/**
 * @api {get} /api/winnerCauses Past Winners
 * @apiDescription Returns a string with the past winner causes
 * @apiName Past Winner Causes
 * @apiGroup Causes
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {String} Year Causes of the year given / if not sent it will return all past causes
 *
 * @apiSuccess {String} result Returns 'success'
 * @apiSuccess {Object[]} causes Array with all the causes
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"id": 129,
      "titulo": "Setembro 2016",
      "data_de_inicio": "21-08-2016 00:00:00",
      "data_de_fim": "20-09-2016 23:59:59",
      "montante_disponivel": "700",
      "total_votos": null,
      "causas": [
        {
          "id": 119,
          "nome": "Causa de teste",
          "descricao_breve": "Causa de teste",
          "descricao": "Uma causa de teste",
          "verba": "250",
          "votos": null,
          "associacao": {
            "nome": "Nome da Associação",
            "apresentacao": null,
            "morada": "Morada da Associação\n", //Isto retorna HTML!!! Cuidado
            "telefone": "210000000",
            "telemovel": "920000000",
            "website": "http://www.nomedaassociacao.tld",
            "email": "email@nomedaassociacao.tld",
            "facebook": "",
            "youtube": ""
          },
          "documentos": [
            {
              "url": null,
              "descricao": null
            }
          ],
          "videos": []
        }
 *     }
 *
 * @apiError {String} result Returns the description of the error
 */
router.get('/winnerCauses', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
        return;
    }

    const formData = {action: 'm1e_votacoes_vencedores'};
    let causes = [];
    if (req.query.ano) {
        let year = req.query.ano
        if (year.length == 4)
            formData.ano = year
    }

    request.post({
        url: M1E_URL,
        form: formData
    }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            let bodyJSON = JSON.parse(body.slice(body.indexOf('{')))
            if (bodyJSON.estado == "NOK") {            //Caso retorne logo erro
                res.status(400);
                res.json({result: bodyJSON.mensagem})
            } else if (bodyJSON.numero_total_de_paginas > 1) {   //Caso tenho mais que 1 página
                async.times(bodyJSON.numero_total_de_paginas - 1, function (n, next) {
                    formData.pagina = n;
                    request.post({
                        url: M1E_URL,
                        form: formData
                    }, function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            causes = causes.concat(bodyJSON.resultados);
                            next(null, body);
                        } else {
                            next(true, null);
                        }
                    })
                }, function (err, ect) {
                    if (err) {
                        res.status(404).json({result: 'Erro'})
                    } else {
                        causes = bodyJSON.resultados;
                        res.json({result: 'success', causes: causes});
                    }
                });
            } else {
                causes = bodyJSON.resultados;
                res.json({result: 'success', causes: causes});

            }
        }
    });

});

/**
 * @api {put} /api/firebaseToken Update Firebase Token
 * @apiDescription In the event of firebase returning a different token to push notifications, the mobile app should
 * notify the server that the token has changed. If this token is outdated the user will not receive notifications
 * sent by the backoffice
 * @apiName Firebase Token
 * @apiGroup Notifications
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {String} firebaseToken New Firebase token
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.put('/firebaseToken', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
    } else if (!req.body.firebaseToken) {
        res.status(401);
        res.json({result: 'Wrong params'});
    } else {
        db.AppUser.findOne({
            where: {
                token: auth,
            },
        })
            .then((result) => {
                result.set('firebase_token', req.body.firebaseToken);
                result.save()
                    .then(res.json({result: 'success'}));
            })
            .catch(() => {
                res.json({result: 'error'});
            });
    }
});

/**
 * @api {post} /api/voteCause/:idVote/:idCause Vote
 * @apiDescription Votes in a specific cause in the current month. The request must have the id of the vote because
 * it's possible to have multiple votes at the same time(rare)
 * @apiName VoteCause
 * @apiGroup Causes
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {Number} idVote Id of the vote the user wishes to vote
 * @apiParam {Number} idCause Id of the cause of that vote the user wishes to vote
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.post('/voteCause/:idVotacao/:idCausa', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
        return;
    }
    const formData = {
        action: 'm1e_adicionar_voto',
        votacao: req.params.idVotacao,
        causa: req.params.idCausa
    };

    request.post({
            url: M1E_URL,
            form: formData
        }, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                let bodyJSON = JSON.parse(body.slice(body.indexOf('{')))
                if (bodyJSON.estado == "NOK") {            //Caso retorne logo erro
                    res.status(400);
                    res.json({result: bodyJSON.mensagem})
                } else if (body.estado == "OK") {      //Caso tenha sucesso
                    res.json({result: 'success'});
                } else {
                    res.status(500);
                    res.json({result: 'Erro desconhecido'})
                }
            }
        }
    );
});

/**
 * @api {get} /api/votingCauses Causes to vote
 * @apiDescription Obtains the causes that an user can vote in the current month
 * @apiName Voting Causes
 * @apiGroup Causes
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiSuccess {String} result Returns 'success'
 * @apiSuccess {Object[]} causes Array with all the causes
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
      "id": 125,
      "titulo": "Outubro 2016",
      "data_de_inicio": "20-09-2016 00:00:00",
      "data_de_fim": "21-11-2016 23:59:59",
      "montante_disponivel": "797",
      "total_votos": "1",
      "utilizador_ja_votou": false,
      "causas": [
        {
          "id": 130,
          "titulo": "Higiene para todos",
          "descricao": "A Comunidade Vida e Paz tem como missão ir ao encontro e acolher pessoas sem-abrigo, ou em situação de vulnerabilidade social, ajudando-as a recuperar a sua dignidade e a (re)construir o seu projeto de vida, através de uma ação integrada de prevenção, reabilitação e reinserção.\r\n\r\nPara podermos oferecer os cuidados básicos de higiene às pessoas sem-abrigo e aos utentes em programa de reabilitação e reinserção necessitamos de produtos básicos de higiene: gel de banho, champô, e pasta de dentes.\r\n\r\nEm 2015, apoiámos diariamente cerca de 500 pessoas através das Equipas de Rua e acolhemos aproximadamente 300  situações nas respostas residenciais da Comunidade: Comunidades Terapêuticas, Comunidades de Inserção, Apartamentos de Reinserção e partilhados e Unidade de Vida Autónoma.\r\n\r\nCom esta simbólica ajuda é abrigo para quem o perdeu!",
          "verba": "750",
          "votos": "0",
          "voto_utilizador": false,
          "associacao": {
            "nome": "Comunidade Vida e Paz",
            "apresentacao": null,
            "morada": "<p>Rua Domingos Bomtempo, nº 7<br />\n1700-142 Lisboa</p>\n",    //CUIDADO QUE ISTO RETORNA HTML
            "telefone": "218460165",
            "telemovel": "",
            "website": "",
            "email": "testes@movimento1euro.com",
            "facebook": "",
            "youtube": ""
          },
          "documentos": [],
          "videos": []
        },
        {
          "id": 132,
          "titulo": "EM’LAÇANDO ALEGRIAS!",
          "descricao": "Estávamos sózinhos em casa!\r\n\r\nAliás, não estávamos sózinhos. A solidão e a<strong> EM </strong>mais conhecida por<strong> Esclerose Múltipla</strong> estavam connosco...........\r\n\r\nSomos milhares, mas delegámos na Helena, na Ana, no Rui e na Luisa  a apresentação  de um anjo da guarda que a <strong>SPEM</strong> “arranjou”  e que  começou a visitar-nos e a modificar os nossos dias.\r\n\r\nAgora esperamos pela sua visita e semana a semana a expectativa renasce.\r\n\r\nPassámos a ter um objetivo! A ter companhia.\r\n\r\nJuntos pintamos, trabalhamos no computador, fazemos cem número de trabalhos no tablet que desenvolvem as nossas criatividades, a imaginação e que avivam na nossa memória. Rimos e conversamos. Estamos a adorar!\r\n\r\nO anjo da guarda é o projeto <strong>EM’Laço, </strong>totalmente inovador, concebido pela  <strong>SPEM - Sociedade Portuguesa de Esclerose Múltipla IPSS</strong>  para prestar apoio aos utentes, que na sua grande maioria se encontram numa situação de extremo isolamento nos seus domicilios, sem condições fisicas ou económicas para sair de casa ou contratar ajudas exteriores.\r\n\r\nO <strong>EM’Laço,</strong> com deslocações semanais que incluem uma educadora social e voluntários formados, proporciona a estes utentes gratuitamente  o acompanhamento que necessitam para desenvolver as suas capacidades cognitivas, de concentração de coordenação motora e para melhorar a comunicação (verbal e não verbal) e a expressão corporal.\r\n\r\nO <strong>EM’Laço </strong> combate assim a solidão, levando de forma informal mas profissional, afeto, conversa e ocupações dinâmicas que por sua vez agilizam a inserção na sociedade e na própria familia, aumentando a auto estima e a indepêndencia de cada utente.\r\n\r\nA outra componente  do projecto <strong>EM’Laço</strong>, e por isso a<strong> SPEM</strong> considera que é um projeto inovador,  é a formação paralela de voluntários  por forma a que os serviços sejam prestados de forma coesa, uniforme, cheia de afetos, carinho e profissional.\r\n\r\nO objetivo é que possa expandir não só em número de pessoas servidas mas a diferentes faixas etárias, uma vez que cada vez mais aparecem jovens com <strong>EM.</strong>\r\n\r\nO <strong>EM’Laço</strong> é um bom exemplo de um 3 em 1: para os utentes combate a solidão, o abandono a que muitas vezes são votados e devolve-lhes expectativas e renova objetivos; para os familiares garante-lhes o bem estar dos seus doentes e permite-lhes os tempos livres que também necessitam; e para todos, dá formação a voluntários para poder chegar a mais doentes.\r\n\r\n<strong>Contribua para a nossa causa</strong> e ajude o <strong> EM’Laço</strong> a levar mais longe os afetos e a servir cada vez  mais e melhor quem precisa de si.",
          "verba": "768.61",
          "votos": "0",
          "voto_utilizador": false,
          "associacao": {
            "nome": "SPEM",
            "apresentacao": null,
            "morada": "<p>Rua Zófimo Pedroso 66<br />\n1950-291 Lisboa</p>\n",
            "telefone": "218650480",
            "telemovel": "",
            "website": "",
            "email": "testes@movimento1euro.com",
            "facebook": "",
            "youtube": ""
          },
          "documentos": [],
          "videos": []
        },
        {
          "id": 133,
          "titulo": "O BEM EM MOVIMENTO",
          "descricao": "Num vai e vem circula a nossa carrinha para o Bem transportar.\r\n\r\nEm movimento estamos e precisamos continuar.\r\n\r\nAo movimento 1 euro pedimos ajuda para a carrinha abastecer\r\n\r\ne os laços de solidariedade fortalecer.",
          "verba": "760",
          "votos": "1",
          "voto_utilizador": false,
          "associacao": {
            "nome": "Casa do Gaiato de Lisboa",
            "apresentacao": null,
            "morada": "<p>Rua Padre Adriano nº 40<br />\n2660-119 Santo Antão do Tojal</p>\n",
            "telefone": "219749974",
            "telemovel": "",
            "website": "",
            "email": "testes@movimento1euro.com",
            "facebook": "",
            "youtube": ""
          },
          "documentos": [],
          "videos": []
        }
      ]
    }
 * @apiError {String} result Returns the description of the error
 */
router.get('/votingCauses', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
        return;
    }
    const formData = {action: 'm1e_votacoes_ativas'};
    let causes = [];

    request.post({
            url: M1E_URL,
            form: formData
        }, function (err, response, body) {
            let bodyJSON = JSON.parse(body.slice(body.indexOf('{')))
            if (!err && response.statusCode == 200) {
                if (bodyJSON.estado == "NOK") {            //Caso retorne logo erro
                    res.status(400);
                    res.json({result: bodyJSON.mensagem})
                } else if (bodyJSON.estado == "OK") {    //Caso tenha sucesso
                    let votacao = bodyJSON.resultados;
                    res.json({result: 'success', votacao: votacao});
                } else {
                    res.status(500);
                    res.json({result: 'Erro desconhecido'})
                }
            }
        }
    );
});

/**
 * @api {put} /api/notificationSeen/ Set notification as seen
 * @apiDescription Set notification as seen
 * @apiName Set Notification Seen
 * @apiGroup Notifications
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 * @apiParam {Number} notificationId id of notification to be set as seen
 *
 * @apiSuccess {String} result Returns 'success'
 *
 * @apiError {String} result Returns 'error'
 */
router.put('/notificationSeen/', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.json({result: 'Authorization required'});
        return;
    }
    if (!req.body.notificationId) {
        res.status(400);
        res.json({result: 'Wrong params'});
    }

    db.AppUser.findOne({where: {'token': auth}})
        .then(() => {
            return db.UserMsg.update({seen:true},{where: {'firebaseMsgID': req.body.notificationId}})
        })
        .then(()=>{
            res.json({result:'Success'})
        })
        .catch(()=>{
            res.json({result:'Error'})
        })
});

/**
 * @api {get} /api/daysToWarn Get title, alert message and number of days to warn the user
 * @apiDescription Get title, alert message and number of days to warn the user
 * @apiName Get number of days to warn the user
 * @apiGroup Alerts
 * @apiVersion 0.1.0
 * @apiHeader {String} Authorization User token
 *
 *
 * @apiSuccess {String} result Returns 'success'
 * @apiSuccess {Number} days_to_warn number of days to warn the user
 * @apiSuccess {String} alertTitle title of the alert
 * @apiSuccess {String} alertMsg content of the message with tag of the alert
 * @apiSuccess {Boolean} active status of the alert (active or not)
 *
 * @apiError {String} result Returns 'error'
 */
router.get('/daysToWarn', (req, res) => {
    const auth = req.get('Authorization');
    if (!auth) {
        res.status(401);
        res.json({result: 'Authorization required'});
        return;
    }
    else {
        db.AppUser.findOne({
            where: {
                token: auth,
            },
        })
            .then((result) => {
                if (result != null) {
                    db.Alert.findOne()
                        .then((alert) => {
                            db.Template.findOne({where: {id: alert.dataValues.TemplateId}})
                                .then((template) => {
                                    res.status(200);
                                    res.json({
                                        result: 'success',
                                        'active': alert.active,
                                        'daysToWarn': alert.start_alert,
                                        'alertTitle': template.name,
                                        'alertMsg': template.content
                                    });
                                })
                        })
                } else {
                    //Mensagem de erro!
                    res.status(401);
                    res.json({result: 'Error firebase token not valid'});
                }
            })
            .catch(() => {
                res.json({result: 'Error'});
            });
    }
});


module.exports = router;
