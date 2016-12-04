/**
 * Created by diogo on 04/12/2016.
 */
const api = require('./api_wrapper');
const db = require('./database');
const request = require('request');

let dayBefore, alertGlobal;

let users2alert = function (next) {
    db.Alert.findOne()
        .then((alert) => {
            dayBefore = alert.start_alert;
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

            /*request({
                method: "POST",
                uri: "https://localhost:3000/notification/sendTemplate",
                json: true,
                body: {ids: usersId, templateId: alertGlobal.templateId}
            })*/
        })
};

module.exports.users2alert = users2alert;

