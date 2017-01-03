/**
 * Created by diogo on 04/12/2016.
 * File to be used with a cronjob to send automatic notifications to the users that their payment date is close.
 */
const api = require('./api_wrapper');
const db = require('./database');
const request = require('request');
const notifications = require('../routes/notification');

let dayBefore, alertGlobal;

let users2alert = function (next) {
    db.Alert.findOne()
        .then((alert) => {
            dayBefore = alert.start_alert;
            if(!alert.active){
                return Promise.reject("Alert is not active");
            }
            alertGlobal = JSON.parse(JSON.stringify(alert));
            return api.getUsersInfo();
        })
        .then((users) => {
            let users2warn = users.filter((user) => {
                let warnDate = new Date(user.nextPayment);
                warnDate.setDate(user.nextPayment.getDate() - dayBefore);
                console.log('Day before: ' + dayBefore);
                console.log('nextPayment date: ' + user.nextPayment);
                console.log('Warning date: ' + warnDate);
                return Date.now() > warnDate
            });
            return Promise.resolve(users2warn);
        })
        .then((users2warn) => {
            console.log("Utilizadores notificados: \n");
            console.log(users2warn);
            let usersId = users2warn.map((user) => {
                return user.id
            });
            notifications.sendTemplateMessage(alertGlobal.TemplateId, usersId, function (results) {
                console.log(results);
                next()
            })

        })
        .catch((err)=>{
            console.log(err);
            next(err);
        })
};

module.exports.users2alert = users2alert;

