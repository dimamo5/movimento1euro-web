var request = require('request');
const SERVER_KEY = 'AIzaSyArnARY44zHlhIyUxWHM6HHC1mUIEAxnFg';

var options = {
    method: 'POST',
    uri: 'https://fcm.googleapis.com/fcm/send',
    headers: {
        'Authorization': 'key=' + SERVER_KEY
    },
    json: true,
    body: {
        notification: {
            "title": "Titulo",
            "body": "Corpo"
        }
    }
};


function sendToOne(id, title, content, next) {
    if (!next || typeof next != "function") {
        throw new Error("4º argument must be a callback function")
    }
    options.body.to = id;
    options.body.notification = {title: title, body: content};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            next(null, true)
        } else {
            var error = new Error(response.getActual + "body")
            next(error, false);
        }
    });
}

function sendToMany(ids, title, content, next) {
    if (!next || typeof next != "function" && ids.constructor === Array) {
        throw new Error("1º argument must be an array function and 4º must be a callback function");
    }
    options.body.registration_ids = ids;
    options.body.notification = {title: title, body: content};
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200 && body.failure == 0) {
            next(null, true)
        } else {
            next(body, false);
        }
    });
}