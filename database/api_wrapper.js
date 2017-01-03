/**
 * Created by diogo on 27/10/2016.
 * Some aux functions related with users
 */
const db = require('../database/database.js');
const crypto = require('crypto');

function getUser(mail, password, next) {
    if (typeof next == 'function') {
        password = crypto.createHash('sha256').update(password).digest('hex');
        db.WpUser.findOne({where: {mail, password}})
            .then(next);
    } else {
        next(null);
    }
}

function getUserFB(fb_id, next) {
    if (typeof next == 'function') {
        db.WpUser.findOne({where: {facebookId: fb_id}})
            .then(function (wpUser) {
                db.AppUser.findOne({where: {external_link_id: wpUser.id}})
                    .then(function (appUser) {
                        var userWithAllInfo = {};
                        userWithAllInfo["appUser"] = appUser;
                        userWithAllInfo["wpUser"] = wpUser;
                        next(null, userWithAllInfo);
                    })
                    .catch(next);  //no link between AppUser/WPUser
            }).catch(next);  //User doesnt exists on db
    } else {
        next(new Error('Next is not a function', null));
    }
}

function getUsersInfo() {
    return db.AppUser.findAll()
        .then((users) => {
            const usersAsync = users.map(getWpUserInfo);
            return Promise.all(usersAsync)
        })
}

function getUsersInfoIds(ids) {
    return db.AppUser.findAll({where: {id: ids}})
        .then((users) => {
            const usersAsync = users.map(getWpUserInfoIds);
            return Promise.all(usersAsync)
        })
}

function getWpUserInfoIds(user) {
    return db.WpUser.findById(user.external_link_id)
        .then((wpuser) => {
            let userPlain = user.toJSON();
            let wpuserPlain = wpuser.toJSON();
            let combined = userPlain;
            combined["name"] = wpuserPlain.name;
            combined["mail"] = wpuserPlain.mail;
            combined["nextPayment"] = wpuserPlain.nextPayment;
            combined["cellphone"] = wpuserPlain.cellphone;
            delete combined.external_link_id;
            delete combined.createdAt;
            delete combined.updatedAt;
            user['wpUser'] = combined;
            return Promise.resolve(user);
        })
}

function getWpUserInfo(user) {
    return db.WpUser.findById(user.external_link_id)
        .then((wpuser) => {
            let userPlain = user.toJSON();
            let wpuserPlain = wpuser.toJSON();
            let combined = userPlain;
            combined["name"] = wpuserPlain.name;
            combined["mail"] = wpuserPlain.mail;
            combined["nextPayment"] = wpuserPlain.nextPayment;
            combined["cellphone"] = wpuserPlain.cellphone;
            delete combined.external_link_id;
            delete combined.createdAt;
            delete combined.updatedAt;
            return Promise.resolve(combined);
        })
}


module.exports.getUser = getUser;
module.exports.getUsersInfo = getUsersInfo;
module.exports.getUserFB = getUserFB;
module.exports.getUsersInfoIds = getUsersInfoIds;


