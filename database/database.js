/**
 * Created by diogo on 16/10/2016.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize('teste', 'ldso', 'mypass', {
    host: 'ldso.diogomoura.me',
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

var templates = sequelize.define('template', {
    text: Sequelize.STRING(45),
    name: Sequelize.TEXT('medium')
});

function getAllTemplates() {
    templates.findAll().then(function (templates) {
        next(templates);
    });
}


templates.sync();

module.exports.templates = templates;
module.exports.getAllTemplates = getAllTemplates;