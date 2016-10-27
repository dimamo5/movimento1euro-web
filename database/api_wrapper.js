/**
 * Created by diogo on 27/10/2016.
 */
var db = require('../database/database.js');
var crypto = require('crypto');

function getUser(mail, password, next) {
    if (typeof next == 'function') {
        password = crypto.createHash('sha256').update(password).digest('base64');
        db.wpUsers.findOne({where: {mail: mail, password: password}})
            .then(next(user))
    }else{
        next(null);
    }
}

module.exports.getUser=getUser;