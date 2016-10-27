/**
 * Created by diogo on 16/10/2016.
 */

/*establishing Connection*/
var Sequelize = require('sequelize');
var config= require('config');
var dbConfig=config.get('dbConfig');
var sequelize = new Sequelize(dbConfig.database, 'ldso', 'mypass', {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

//table admin
var admins = sequelize.define('admin', {
    username: {
        type: Sequelize.STRING('20'),
        allowNull: false
    },
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny')
    },
    password: {
        allowNull: false,
        type: Sequelize.CHAR('64')
    }
});

var mobileAppUsers = sequelize.define('mobile_app_users', {
    //id link to mov1€'s external database
    external_link_id: {
        allowNull: false,
        type: Sequelize.INTEGER
    },
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny')
    },
    last_visit: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    token:{
        allowNull: false,
        type: Sequelize.STRING(24)
    }
});


//table template
var templates = sequelize.define('template', {
    name: Sequelize.STRING(45),
    content: Sequelize.TEXT('medium')
});

//table alert - yearly paymentt
var alerts = sequelize.define('alert', {
    active: {
        allowNull: false,
        type: Sequelize.BOOLEAN
    },
    //the alert should start 1<X<28 days before
    start_alert:{
        allowNull: false,
        type: Sequelize.INTEGER,
        max: 28,                  // only allow values
        min: 1
    },
    //notification alert repetition periodicity till the due date
    repetition_periodicity: {
       allowNull: false,
       type: Sequelize.STRING(24)
   }
});

var messages = sequelize.define('message', {
    msg_type:{
        allowNull: false,
        type: Sequelize.ENUM('Manual', 'Template', 'Alert')
    },
    //may have content if it's manual (without template)
    content: Sequelize.TEXT('medium'),
    date: Sequelize.DATE
});

//association between users/Msgs
var seenMessages = sequelize.define('seen_msg',{
   seen: {
       allowNull: false,
       type: Sequelize.BOOLEAN
   }
});

/* Relation specification */
messages.belongsToMany(mobileAppUsers, {through: seenMessages});
mobileAppUsers.belongsToMany(messages, {through: seenMessages});
templates.hasMany(messages);
//TODO add 0..1 associations


//admin creation for dev purpose //Todo remove this code
admins.findOrCreate({where: {username: 'root'}, defaults: {username: 'root', name: 'root', password: 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='}});

//sincrioniza todas as tabelas
sequelize.sync();


module.exports.templates = templates;
module.exports.admins = admins;