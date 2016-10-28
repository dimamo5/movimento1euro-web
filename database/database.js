/**
 * Created by diogo on 16/10/2016.
 */

/*establishing Connection*/
var Sequelize = require('sequelize');
var config = require('config');
var dbConfig = config.get('dbConfig');
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
    token: {
        allowNull: true,
        defaultValue: null,
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
    start_alert: {
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
    msg_type: {
        allowNull: false,
        type: Sequelize.ENUM('Manual', 'Template', 'Alert')
    },
    //may have content if it's manual (without template)
    content: Sequelize.TEXT('medium'),
    date: Sequelize.DATE
});

//association between users/Msgs
var seenMessages = sequelize.define('seen_msg', {
    seen: {
        allowNull: false,
        type: Sequelize.BOOLEAN
    }
});

/* Relation specification */
messages.belongsToMany(mobileAppUsers, {through: seenMessages});
mobileAppUsers.belongsToMany(messages, {through: seenMessages});
templates.hasMany(messages);
templates.hasMany(alerts);



//============ WP Database Simulation ================

var wpUsers = sequelize.define('wp_users', {
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny')
    },
    mail: {
        allowNull: false,
        type: Sequelize.TEXT('tiny'),
        validate: {
            isEmail: true            // checks for email format (foo@bar.com)
        }
    },
    password: {
        allowNull: false,
        type: Sequelize.TEXT('tiny')
    },
    lastPayment: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    facebook: Sequelize.TEXT('medium')
});

var wpCauses = sequelize.define('wp_causes', {
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny')
    },
    description: {
        allowNull: false,
        type: Sequelize.TEXT('medium')
    },
    month: {
        allowNull: false,
        type: Sequelize.TEXT('tiny')
    },
    winner: {
        allowNull: false,
        type: Sequelize.BOOLEAN
    },
    date: Sequelize.DATE

});

var wpCausesUsers = sequelize.define('wp_causes_users', {});

wpCauses.belongsToMany(wpUsers, {through: wpCausesUsers});
wpUsers.belongsToMany(wpCauses, {through: wpCausesUsers});




function populateDB() {

//admin creation for dev purpose //Todo remove this code
    admins.findOrCreate({
        where: {username: 'root'},
        defaults: {username: 'root', name: 'root', password: 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='}
    });

    wpUsers.bulkCreate(
        [{
            name: 'João',
            mail: 'joao@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2011, 4, 14, 16, 25, 0, 0)
        },
            {
                name: 'Maria',
                mail: 'maria@cenas.pt',
                password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
                lastPayment: new Date(2014, 9, 5, 16, 25, 0, 0)
            },
            {
                name: 'Tomas',
                mail: 'tomas@cenas.pt',
                password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
                lastPayment: new Date(2011, 12, 7, 16, 25, 0, 0)
            },
            {
                name: 'Diogo',
                mail: 'diogo@cenas.pt',
                password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
                lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0)
            },
            {
                name: 'Ines',
                mail: 'ines@cenas.pt',
                password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
                lastPayment: new Date(2013, 9, 23, 16, 25, 0, 0)
            },
            {
                name: 'Mariana',
                mail: 'mariana@cenas.pt',
                password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
                lastPayment: new Date(2014, 3, 18, 16, 25, 0, 0)
            }]
    )

    wpCauses.bulkCreate([
        {
            name: 'Lar de Infância e Juventude Casa da Criança',
            description: 'A Casa da Criança é um Lar de Infância e Juventude (LIJ) e constitui uma das valências disponibilizadas à comunidade pela Santa Casa da Misericórdia do Peso da Régua (SCMPR). ',
            month: 'janeiro',
            winner: true,
            date: new Date(2015, 1, 1, 10, 0, 0, 0)
        },
        {
            name: 'ELO SOCIAL - IPSS',
            description: 'Elo Social – Associação para a Integração e Apoio ao Deficiente Jovem e Adulto, é uma Instituição Particular de Solidariedade Social, sediada em Lisboa, considerada Pessoa Coletiva de Utilidade Pública,...',
            month: 'outubro',
            winner: false,
            date: new Date(2015, 10, 15, 11, 10, 0, 0)
        },
        {
            name: 'ASSOCIAÇÃO NOVAMENTE',
            description: 'A Associação Novamente tem um grupo de interajuda, integrado por pessoas que passam pela mesma situação (TCE ou outra lesão cerebral adquirida), com vista a encontrar soluções pela partilha de experiências e troca de informações.',
            month: 'Agosto',
            winner: false,
            date: new Date(2015, 8, 5, 18, 30, 0, 0)
        }])

    messages.bulkCreate([
        {
            msg_type: 'Manual',
            content: 'Exemplo de mensagem manual',
            date: new Date(2016, 10, 28, 16, 45, 0, 0)
        }, {
            msg_type: 'Template',
            content: 'Exemplo de mensagem template',
            date: new Date(2016, 10, 28, 16, 45, 0, 0)
        },
        {
            msg_type: 'Alert',
            content: 'Exemplo de mensagem alerta',
            date: new Date(2016, 10, 28, 16, 45, 0, 0)
        }
    ])

    mobileAppUsers.bulkCreate([
        {
            external_link_id: 4,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
        },
        {
            external_link_id: 1,
            name: 'João',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
        },
        {
            external_link_id: 5,
            name: 'Ines',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
        }
    ])

    alerts.create(
        {
            active: true,
            start_alert: 1,
            repetition_periodicity: 'semanal'
        }
    );

    templates.bulkCreate([
        {
            name: 'Pagamento proximo da data',
            content: 'O pagamento da mensalidade encontra-se proximo @lastpayment'
        },
        {
            name: 'Causa vencedora',
            content: 'A causa vencedora deste mês é: @nomeCausa, @descrição'
        },
        {
            name: 'Nova causa',
            content: 'Ex.@name,' +
            ' Este mes temos o prazer de apresentar @nameCausa.'
        }
    ])

}


//sincrioniza todas as tabelas
sequelize.sync({force: true})
    .then( function(){
        populateDB();
    });
module.exports = {admins, mobileAppUsers, templates, alerts, messages, wpUsers, wpCauses};
