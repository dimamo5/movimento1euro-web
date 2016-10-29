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
var Admins = sequelize.define('admin', {
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
    }
);

var MobileAppUser = sequelize.define('mobile_app_user', {
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
var Template = sequelize.define('template', {
    name: Sequelize.STRING(45),
    content: Sequelize.TEXT('medium')
});

//table alert - yearly paymentt
var Alert = sequelize.define('alert', {
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

var Message = sequelize.define('message', {
    msg_type: {
        allowNull: false,
        type: Sequelize.ENUM('Manual', 'Template', 'Alert')
    },
    //may have content if it's manual (without template)
    content: Sequelize.TEXT('medium'),
    date: Sequelize.DATE
});

//association between users/Msgs
var SeenMessages = sequelize.define('seen_msg', {
    seen: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});

/* Relation specification */
Message.belongsToMany(MobileAppUser, {through: SeenMessages});
MobileAppUser.belongsToMany(Message, {through: SeenMessages});
Template.hasMany(Message);
Template.hasMany(Alert);

//============ WP Database Simulation ================

var WpUsers = sequelize.define('wp_users', {
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

var WpCauses = sequelize.define('wp_causes', {
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

var WpCausesUsers = sequelize.define('wp_causes_users', {});

WpCauses.belongsToMany(WpUsers, {through: WpCausesUsers});
WpUsers.belongsToMany(WpCauses, {through: WpCausesUsers});


function populateDB() {

//admin creation for dev purpose
    Admins.findOrCreate({
        where: {username: 'root'},
        defaults: {username: 'root', name: 'root', password: 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='}
    });

    var wpUser1 = WpUsers.create({
        name: 'João',
        mail: 'joao@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2011, 4, 14, 16, 25, 0, 0)
    });
    var wpUser2 = WpUsers.create({
        name: 'Maria',
        mail: 'maria@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2014, 9, 5, 16, 25, 0, 0)
    });
    var wpUser3 = WpUsers.create({
        name: 'Ines',
        mail: 'ines@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2013, 9, 23, 16, 25, 0, 0)
    });

    var wpUser4 = WpUsers.create({
        name: 'Tomas',
        mail: 'tomas@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2011, 12, 7, 16, 25, 0, 0)
    });

    var wpUser5 = WpUsers.create({
        name: 'Diogo',
        mail: 'diogo@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0)
    });

    var wpUser6 = WpUsers.create({
        name: 'Mariana',
        mail: 'mariana@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2014, 3, 18, 16, 25, 0, 0)
    });

    var wpCauses1 = WpCauses.create({
        name: 'Lar de Infância e Juventude Casa da Criança',
        description: 'A Casa da Criança é um Lar de Infância e Juventude (LIJ) e constitui uma das valências disponibilizadas à comunidade pela Santa Casa da Misericórdia do Peso da Régua (SCMPR). ',
        month: 'janeiro',
        winner: true,
        date: new Date(2015, 1, 1, 10, 0, 0, 0)
    });

    var wpCauses2 = WpCauses.create({
        name: 'ELO SOCIAL - IPSS',
        description: 'Elo Social – Associação para a Integração e Apoio ao Deficiente Jovem e Adulto, é uma Instituição Particular de Solidariedade Social, sediada em Lisboa, considerada Pessoa Coletiva de Utilidade Pública,...',
        month: 'outubro',
        winner: false,
        date: new Date(2015, 10, 15, 11, 10, 0, 0)
    });

    var wpCauses3 = WpCauses.create({
        name: 'ASSOCIAÇÃO NOVAMENTE',
        description: 'A Associação Novamente tem um grupo de interajuda, integrado por pessoas que passam pela mesma situação (TCE ou outra lesão cerebral adquirida), com vista a encontrar soluções pela partilha de experiências e troca de informações.',
        month: 'Agosto',
        winner: false,
        date: new Date(2015, 8, 5, 18, 30, 0, 0)
    });

    var wpCauses4 = WpCauses.create({
        name: ' Centro de Apoio Familiar e Aconselhamento Parental O FAROL ',
        description: 'No âmbito do Banco de Recursos, desenvolveu o projeto Grão a Grão que consiste na distribuição semanal de alimentos a 30 famílias carenciadas com crianças.  ',
        month: 'janeiro',
        winner: true,
        date: new Date(2015, 1, 1, 10, 0, 0, 0)
    });

    var wpCauses5 = WpCauses.create({
        name: 'Associação Alzheimer Portugal',
        description: 'Como membro da Alzheimer Europe a Associação participa ativamente no movimento europeu sobre as demências, procurando reunir e divulgar os conhecimentos mais recentes sobre a doença de Alzheimer, promovendo o seu estudo, a investigação das suas causas, efeitos, profilaxias e tratamentos.',
        month: 'janeiro',
        winner: true,
        date: new Date(2015, 1, 1, 10, 0, 0, 0)
    });


    var msg1 = Message.build({
        msg_type: 'Manual',
        content: 'Exemplo de mensagem manual',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });


    var msg2 = Message.build({
        msg_type: 'Template',
        content: 'Exemplo de mensagem template',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var msg3 = Message.build({
        msg_type: 'Alert',
        content: 'Exemplo de mensagem alerta',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser1 = MobileAppUser.build({
        external_link_id: 4,
        name: 'Diogo',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser2 = MobileAppUser.build({
        external_link_id: 1,
        name: 'João',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser3 = MobileAppUser.build({
        external_link_id: 5,
        name: 'Ines',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var alert1 = Alert.build({
        active: true,
        start_alert: 1,
        repetition_periodicity: 'semanal'
    });

    var temp1 = Template.build({
        name: 'Pagamento proximo da data',
        content: 'O pagamento da mensalidade encontra-se proximo @lastpayment'
    });

    var temp2 = Template.build({
        name: 'Causa vencedora',
        content: 'A causa vencedora deste mês é: @nomeCausa, @descrição'
    });


    var temp3 = Template.build({
        name: 'Nova causa',
        content: 'Ex.@name,' +
        ' Este mes temos o prazer de apresentar @nameCausa.'
    });

    Promise.all([msg1.save(), msg2.save(), msg3.save(), temp1.save(), temp2.save(), temp3.save(),
        appUser1.save(), appUser2.save(), appUser3.save(), alert1.save()])
        .then(function () {
            temp1.setAlerts([alert1]);
        });
    Promise.all([wpUser1.save(), wpUser2.save(), wpUser3.save(), wpUser4.save(), wpUser5.save(),
        wpUser6.save(), wpCauses1.save(), wpCauses2.save(), wpCauses3.save(), wpCauses4.save(), wpCauses5.save()])
        .then(function(){
            //TODO ficamos aqui!
        })

}


//sincrioniza todas as tabelas
sequelize.sync({force: true})
    .then(function () {
        populateDB();
    });
module.exports = {Admins, MobileAppUser, Template, Alert, Message, WpUsers, WpCauses};
