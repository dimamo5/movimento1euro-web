/**
 * Created by diogo on 16/10/2016.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize('ldso', 'ldso', 'mypass', {
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
    name: Sequelize.STRING(45),
    content: Sequelize.TEXT('medium')
});


templates.sync();

module.exports.templates = templates;