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
    logging: dbConfig.logging,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

//table admin
var Admin = sequelize.define('Admin', {
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

var AppUser = sequelize.define('AppUser', {
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
        type: Sequelize.STRING(96)
    },
    firebase_token: Sequelize.TEXT('tiny')
});


//table template
var Template = sequelize.define('Template', {
    name: Sequelize.STRING(45),
    content: Sequelize.TEXT('medium')
});

//table alert - yearly paymentt
var Alert = sequelize.define('Alert', {
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

var Message = sequelize.define('Message', {
    msg_type: {
        allowNull: false,
        type: Sequelize.ENUM('Manual', 'Template', 'Alert')
    },
    //may have content if it's manual (without template)
    content: Sequelize.TEXT('medium'),
    date: Sequelize.DATE
});

//association between users/Msgs
var SeenMessage = sequelize.define('SeenMsg', {
    seen: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});

/* Relation specification */
Message.belongsToMany(AppUser, {through: SeenMessage});
AppUser.belongsToMany(Message, {through: SeenMessage});
Template.hasMany(Message);
Template.hasMany(Alert);

//============ WP Database Simulation ================

var WpUser = sequelize.define('WpUser', {
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

var WpCause = sequelize.define('WpCauses', {
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
        type: Sequelize.INTEGER,
        max: 12,
        min: 1
    },
    winner: {
        allowNull: false,
        type: Sequelize.BOOLEAN
    },
    date: Sequelize.DATE,
    image:Sequelize.TEXT('tiny')

});

var WpCausesUsers = sequelize.define('WpCausesUsers', {});

WpCause.belongsToMany(WpUser, {through: WpCausesUsers});
WpUser.belongsToMany(WpCause, {through: WpCausesUsers});


function populateDB() {

//admin creation for dev purpose
    Admin.findOrCreate({
        where: {username: 'root'},
        defaults: {
            username: 'root',
            name: 'root',
            password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
        }
    });

    //Pass de todos é 123

    var wpUser1 = WpUser.build({
        name: 'João',
        mail: 'joao@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2011, 4, 14, 16, 25, 0, 0)
    });

    var wpUser2 = WpUser.build({
        name: 'Maria',
        mail: 'maria@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2014, 9, 5, 16, 25, 0, 0)
    });
    var wpUser3 = WpUser.build({
        name: 'Ines',
        mail: 'ines@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2013, 9, 23, 16, 25, 0, 0)
    });

    var wpUser4 = WpUser.build({
        name: 'Tomas',
        mail: 'tomas@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2011, 12, 7, 16, 25, 0, 0)
    });

    var wpUser5 = WpUser.build({
        name: 'Diogo',
        mail: 'diogo@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0)
    });

    var wpUser6 = WpUser.build({
        name: 'Mariana',
        mail: 'mariana@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2014, 3, 18, 16, 25, 0, 0)
    });

    var wpUser7 = WpUser.build({
        name: 'Marina',
        mail: 'Marina@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2016, 12, 27, 18, 25, 0, 0)
    });

    var wpUser8 = WpUser.build({
        name: 'Candido',
        mail: 'candido@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2016, 12, 7, 17, 25, 0, 0)
    });

    var wpUser9 = WpUser.build({
        name: 'Paulo',
        mail: 'paulo@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2016, 12, 23, 10, 25, 0, 0)
    });

    var wpUser10 = WpUser.build({
        name: 'Ana',
        mail: 'ana@cenas.pt',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        lastPayment: new Date(2016, 11, 4, 13, 25, 0, 0)
    });

    var wpCauses1 = WpCause.build({
        name: 'Lar de Infância e Juventude Casa da Criança',
        description: 'A Casa da Criança é um Lar de Infância e Juventude (LIJ) e constitui uma das valências disponibilizadas à comunidade pela Santa Casa da Misericórdia do Peso da Régua (SCMPR). ',
        month: '1',
        winner: true,
        date: new Date(2015, 1, 1, 10, 0, 0, 0)
    });

    var wpCauses2 = WpCause.build({
        name: 'ELO SOCIAL - IPSS',
        description: 'Elo Social – Associação para a Integração e Apoio ao Deficiente Jovem e Adulto, é uma Instituição Particular de Solidariedade Social, sediada em Lisboa, considerada Pessoa Coletiva de Utilidade Pública,...',
        month: '10',
        winner: true,
        date: new Date(2015, 10, 15, 11, 10, 0, 0)
    });

    var wpCauses3 = WpCause.build({
        name: 'ASSOCIAÇÃO NOVAMENTE',
        description: 'A Associação Novamente tem um grupo de interajuda, integrado por pessoas que passam pela mesma situação (TCE ou outra lesão cerebral adquirida), com vista a encontrar soluções pela partilha de experiências e troca de informações.',
        month: '8',
        winner: false,
        date: new Date(2015, 8, 5, 18, 30, 0, 0)
    });

    var wpCauses4 = WpCause.build({
        name: ' Centro de Apoio Familiar e Aconselhamento Parental O FAROL ',
        description: 'No âmbito do Banco de Recursos, desenvolveu o projeto Grão a Grão que consiste na distribuição semanal de alimentos a 30 famílias carenciadas com crianças.  ',
        month: '1',
        winner: false,
        date: new Date(2015, 1, 1, 10, 0, 0, 0)
    });

    var wpCauses5 = WpCause.build({
        name: 'Associação Alzheimer Portugal',
        description: 'Como membro da Alzheimer Europe a Associação participa ativamente no movimento europeu sobre as demências, procurando reunir e divulgar os conhecimentos mais recentes sobre a doença de Alzheimer, promovendo o seu estudo, a investigação das suas causas, efeitos, profilaxias e tratamentos.',
        month: '1',
        winner: false,
        date: new Date(2015, 1, 1, 10, 0, 0, 0)
    });

    var wpCauses6 = WpCause.build({
        name: 'Lar da Boa Vontade',
        description: 'O Lar da Boa Vontade é uma residência adaptada para adultos com deficiência motora. Como tal é necessário a compra de material de Fisioterapia e Terapia Ocupacional, que promova não só a reabilitação motora, mas também as competências sociais e cognitivas dos nossos clientes, para que possam ser os mais independentes e funcionais possível!',
        month: '11',
        winner: false,
        date: new Date(2016, 11, 1, 10, 0, 0, 0)
    });

    var wpCauses7 = WpCause.build({
        name: 'Centro Raríssimo da Maia – Centro Multidisciplinar de Reabilitação Intensiva ',
        description: 'O Centro Raríssimo da Maia – Centro Multidisciplinar de Reabilitação Intensiva – presta serviços de saúde de excelência direcionados a portadores de deficiências mentais e raras. ',
        month: '11',
        winner: false,
        date: new Date(2016, 11, 1, 10, 0, 0, 0)
    });

    var wpCauses8 = WpCause.build({
        name: 'Elo Social – Associação para a Integração e Apoio às Pessoas com Deficiência Mental',
        description: 'Dado que apoiamos os mais diferentes níveis de deficiência mental – Ligeiro, Moderado, Grave e Profundo, muitos são os problemas físicos e orgânicos associados, sobretudo aos casos de paralisia cerebral e a outros mais dependentes, agudizados com o seu processo de envelhecimento. ',
        month: '11',
        winner: false,
        date: new Date(2016, 11, 1, 10, 0, 0, 0)
    });


    var msg1 = Message.build({
        msg_type: 'Manual',
        content: 'Exemplo de mensagem manual',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });


    var msg2 = Message.build({
        msg_type: 'Template',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var msg3 = Message.build({
        msg_type: 'Alert',
        content: 'Exemplo de mensagem alerta',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var msg4 = Message.build({
        msg_type: 'Manual',
        content: 'Segunda mensagem manual...',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var msg5 = Message.build({
        msg_type: 'Template',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var msg6 = Message.build({
        msg_type: 'Manual',
        content: 'Terceira mensagem manual',
        date: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser1 = AppUser.build({
        external_link_id: 5,
        name: 'Diogo',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser2 = AppUser.build({
        external_link_id: 1,
        name: 'João',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser3 = AppUser.build({
        external_link_id: 3,
        name: 'Ines',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser4 = AppUser.build({
        external_link_id: 6,
        name: 'Mariana',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser5 = AppUser.build({
        external_link_id: 8,
        name: 'Candido',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser6 = AppUser.build({
        external_link_id: 9,
        name: 'Paulo',
        last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
    });

    var appUser7 = AppUser.build({
        external_link_id: 10,
        name: 'Ana',
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

    Promise.all([msg1.save(), msg2.save(), msg3.save(), msg4.save(), msg5.save(), msg6.save(), temp1.save(), temp2.save(), temp3.save(),
        appUser1.save(), appUser2.save(), appUser3.save(), appUser4.save(), appUser5.save(), appUser6.save(), appUser7.save(), alert1.save()])
        .then(function () {
            temp1.setAlerts([alert1]); //associa alerta a temp
            temp2.setMessages([msg2]); //associa mensagem a temp
            temp3.setMessages([msg5]); //associa mensagem a temp
            appUser1.setMessages([msg1], {seen: true}); //enviar mensagem manual
            appUser1.setMessages([msg4], {seen: true}); //enviar mensagem manual
            appUser3.setMessages([msg6], {seen: false}); //enviar mensagem manual
            msg5.setAppUsers([appUser2, appUser4, appUser5, appUser6, appUser7], {seen: false}) //mesma mensagem template para multiplos utilizadores

        });
    Promise.all([wpUser1.save(), wpUser2.save(), wpUser3.save(), wpUser4.save(), wpUser5.save(),
        wpUser6.save(), wpUser7.save(), wpUser8.save(), wpUser9.save(), wpUser10.save(), wpCauses1.save(),
        wpCauses2.save(), wpCauses3.save(), wpCauses4.save(), wpCauses5.save(), wpCauses6.save(), wpCauses7.save(),
        wpCauses8.save()])
        .then(function () {
            //votacoes deste mes
            wpCauses6.setWpUsers([wpUser1, wpUser3, wpUser5, wpUser6]);
            wpCauses7.setWpUsers([wpUser8, wpUser10]);
            wpCauses8.setWpUsers([wpUser9]);
        })

}


//sincrioniza todas as tabelas
function clear() {
    return sequelize.sync({force: true});
}

if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'staging') {
    clear()
        .then(function () {
            populateDB();
        });
}


module.exports = {Admin, AppUser, Template, Alert, Message, WpUser, WpCause, clear};
