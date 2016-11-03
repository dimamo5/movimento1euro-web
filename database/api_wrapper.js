/**
 * Created by diogo on 27/10/2016.
 */
const db = require('../database/database.js');
const crypto = require('crypto');

function getUser(mail, password, next) {
  if (typeof next == 'function') {
    password = crypto.createHash('sha256').update(password).digest('hex');
    db.WpUser.findOne({ where: { mail, password } })
            .then(next);
  } else {
    next(null);
  }
}

function getUsersInfo() {
  return db.WpUser.findAll({ attributes: { exclude: ['password'] } });
}

module.exports.getUser = getUser;
module.exports.getUsersInfo = getUsersInfo;
