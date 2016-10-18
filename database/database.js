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

var admins = sequelize.define('admin', {
    username: {
        type: Sequelize.STRING('20'),
        allowNull: false
    },
    name: {
        allowNull: true,
        type: Sequelize.TEXT('tiny')
    },
    password: {
        allowNull: false,
        type: Sequelize.CHAR('64')
    }
});

admins.findOrCreate({where: {username: 'root'}, defaults: {username: 'root', name: 'root', password: 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='}});
admins.sync();
templates.sync();


module.exports.templates = templates;
module.exports.admins = admins;