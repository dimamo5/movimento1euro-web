/**
 * Created by diogo on 16/10/2016.
 */

/* establishing Connection*/
const Sequelize = require('sequelize');
const config = require('config');
const dbConfig = config.get('dbConfig');
const sequelize = new Sequelize(dbConfig.database, 'ldso', 'mypass', {
    host: dbConfig.host,
    port: dbConfig.port,
    logging: dbConfig.logging,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
});

// table admin
const Admin = sequelize.define('Admin', {
        username: {
            type: Sequelize.STRING('20'),
            allowNull: false,
        },
        name: {
            allowNull: false,
            type: Sequelize.TEXT('tiny'),
        },
        password: {
            allowNull: false,
            type: Sequelize.CHAR('64'),
        },
    }
);

const AppUser = sequelize.define('AppUser', {
    // id link to mov1€'s external database
    external_link_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny'),
    },
    last_visit: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    token: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.STRING(96),
    },
    firebase_token: Sequelize.TEXT('medium'),
    cookie:Sequelize.TEXT('medium')
});

// table template
const Template = sequelize.define('Template', {
    name: {
        allowNull: false,
        type: Sequelize.STRING(45),
        validate: {
            notEmpty: true
        }
    },
    content: {
        allowNull: false,
        type: Sequelize.TEXT('medium'),
        validate: {
            notEmpty: true
        }
    },
});

// table alert - yearly paymentt
const Alert = sequelize.define('Alert', {
    active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
    },
    // the alert should start 1<X<1 days before
    start_alert: {
        allowNull: false,
        type: Sequelize.INTEGER,
        max: 1,                  // only allow values
        min: 1,
    },
    // notification alert repetition periodicity till the due date
    repetition_periodicity: {
        allowNull: false,
        type: Sequelize.STRING(24),
    },
});

const Message = sequelize.define('Message', {
    msg_type: {
        allowNull: false,
        type: Sequelize.ENUM('Manual', 'Template', 'Alert'),
    },
    // may have content if it's manual (without template)
    content: Sequelize.TEXT('medium'),
    title: Sequelize.TEXT('tiny'),
    date: Sequelize.DATE,
});

// association between users/Msgs

const UserMsg = sequelize.define('UserMsg', {
    seen: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    firebaseMsgID : {
        allowNull: true,
        type: Sequelize.STRING
    }
});

/* Relation specification */
Message.belongsToMany(AppUser, {through: UserMsg});
AppUser.belongsToMany(Message, {through: UserMsg});
Template.hasMany(Message);
Template.hasMany(Alert);

//= =========== WP Database Simulation ================

const WpUser = sequelize.define('WpUser', {
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny'),
    },
    mail: {
        allowNull: false,
        type: Sequelize.TEXT('tiny'),
        validate: {
            isEmail: true,            // checks for email format (foo@bar.com)
        },
    },
    password: {
        allowNull: false,
        type: Sequelize.TEXT('tiny'),
    },
    cellphone: Sequelize.STRING('9'),
    nextPayment: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    facebookId: Sequelize.TEXT('tiny'),
});

const WpCause = sequelize.define('WpCauses', {
    name: {
        allowNull: false,
        type: Sequelize.TEXT('tiny'),
    },
    description: {
        allowNull: false,
        type: Sequelize.TEXT('medium'),
    },
    month: {
        allowNull: false,
        type: Sequelize.INTEGER,
        max: 12,
        min: 1,
    },
    winner: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
    },
    date: Sequelize.DATE,
    image: Sequelize.TEXT('tiny'),

});

const WpCausesUsers = sequelize.define('WpCausesUsers', {});

WpCause.belongsToMany(WpUser, {through: WpCausesUsers});
WpUser.belongsToMany(WpCause, {through: WpCausesUsers});


function populateDB() {
// admin creation for dev purpose
    Admin.findOrCreate({
        where: {username: 'root'},
        defaults: {
            username: 'root',
            name: 'root',
            password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        },
    });

    // Pass de todos é 123

    const wpUser1 = WpUser.build({
        name: 'João',
        mail: 'joao@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2011, 4, 14, 16, 25, 0, 0),
        facebookId: 1319444014767273
    });

    const wpUser2 = WpUser.build({
        name: 'Maria',
        mail: 'maria@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2014, 9, 5, 16, 25, 0, 0),
    });
    const wpUser3 = WpUser.build({
        name: 'Ines',
        mail: 'ines@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2013, 9, 23, 16, 25, 0, 0),
    });

    const wpUser4 = WpUser.build({
        name: 'Tomas',
        mail: 'tomas@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2011, 12, 7, 16, 25, 0, 0),
    });

    const wpUser5 = WpUser.build({
        name: 'Diogo',
        mail: 'diogo@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2012, 1, 12, 16, 25, 0, 0),
    });

    const wpUser6 = WpUser.build({
        name: 'Mariana',
        mail: 'mariana@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2014, 3, 18, 16, 25, 0, 0),
    });

    const wpUser7 = WpUser.build({
        name: 'Marina',
        mail: 'Marina@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2016, 12, 27, 18, 25, 0, 0),
    });

    const wpUser8 = WpUser.build({
        name: 'Candido',
        mail: 'candido@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2016, 12, 7, 17, 25, 0, 0),
    });

    const wpUser9 = WpUser.build({
        name: 'Paulo',
        mail: 'paulo@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2016, 12, 23, 10, 25, 0, 0),
    });

    const wpUser10 = WpUser.build({
        name: 'Ana',
        mail: 'ana@cenas.pt',
        cellphone: '987654321',
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        nextPayment: new Date(2016, 11, 4, 13, 25, 0, 0),
    });

    const wpCauses1 = WpCause.build({
        name: 'Lar de Infância e Juventude Casa da Criança',
        description: 'A Casa da Criança é um Lar de Infância e Juventude (LIJ) e constitui uma das valências disponibilizadas à comunidade pela Santa Casa da Misericórdia do Peso da Régua (SCMPR). ',
        month: '1',
        winner: true,
        date: new Date(2015, 1, 1, 10, 0, 0, 0),
    });

    const wpCauses2 = WpCause.build({
        name: 'ELO SOCIAL - IPSS',
        description: 'Elo Social – Associação para a Integração e Apoio ao Deficiente Jovem e Adulto, é uma Instituição Particular de Solidariedade Social, sediada em Lisboa, considerada Pessoa Coletiva de Utilidade Pública,...',
        month: '10',
        winner: true,
        date: new Date(2015, 10, 15, 11, 10, 0, 0),
    });

    const wpCauses3 = WpCause.build({
        name: 'ASSOCIAÇÃO NOVAMENTE',
        description: 'A Associação Novamente tem um grupo de interajuda, integrado por pessoas que passam pela mesma situação (TCE ou outra lesão cerebral adquirida), com vista a encontrar soluções pela partilha de experiências e troca de informações.',
        month: '8',
        winner: false,
        date: new Date(2015, 8, 5, 18, 30, 0, 0),
    });

    const wpCauses4 = WpCause.build({
        name: ' Centro de Apoio Familiar e Aconselhamento Parental O FAROL ',
        description: 'No âmbito do Banco de Recursos, desenvolveu o projeto Grão a Grão que consiste na distribuição semanal de alimentos a 30 famílias carenciadas com crianças.  ',
        month: '1',
        winner: false,
        date: new Date(2015, 1, 1, 10, 0, 0, 0),
    });

    const wpCauses5 = WpCause.build({
        name: 'Associação Alzheimer Portugal',
        description: 'Como membro da Alzheimer Europe a Associação participa ativamente no movimento europeu sobre as demências, procurando reunir e divulgar os conhecimentos mais recentes sobre a doença de Alzheimer, promovendo o seu estudo, a investigação das suas causas, efeitos, profilaxias e tratamentos.',
        month: '1',
        winner: false,
        date: new Date(2015, 1, 1, 10, 0, 0, 0),
    });

    const wpCauses6 = WpCause.build({
        name: 'Lar da Boa Vontade',
        description: 'O Lar da Boa Vontade é uma residência adaptada para adultos com deficiência motora. Como tal é necessário a compra de material de Fisioterapia e Terapia Ocupacional, que promova não só a reabilitação motora, mas também as competências sociais e cognitivas dos nossos clientes, para que possam ser os mais independentes e funcionais possível!',
        month: '11',
        winner: false,
        date: new Date(2016, 11, 1, 10, 0, 0, 0),
    });

    const wpCauses7 = WpCause.build({
        name: 'Centro Raríssimo da Maia – Centro Multidisciplinar de Reabilitação Intensiva ',
        description: 'O Centro Raríssimo da Maia – Centro Multidisciplinar de Reabilitação Intensiva – presta serviços de saúde de excelência direcionados a portadores de deficiências mentais e raras. ',
        month: '11',
        winner: false,
        date: new Date(2016, 11, 1, 10, 0, 0, 0),
    });

    const wpCauses8 = WpCause.build({
        name: 'Elo Social – Associação para a Integração e Apoio às Pessoas com Deficiência Mental',
        description: 'Dado que apoiamos os mais diferentes níveis de deficiência mental – Ligeiro, Moderado, Grave e Profundo, muitos são os problemas físicos e orgânicos associados, sobretudo aos casos de paralisia cerebral e a outros mais dependentes, agudizados com o seu processo de envelhecimento. ',
        month: '11',
        winner: false,
        date: new Date(2016, 11, 1, 10, 0, 0, 0),
    });


    const msg1 = Message.build({
        msg_type: 'Manual',
        content: 'Exemplo de mensagem manual',
        date: new Date(2016, 10, 1, 16, 45, 0, 0),
        title: 'titulo generico',
    });


    const msg2 = Message.build({
        msg_type: 'Template',
        date: new Date(2016, 10, 1, 16, 45, 0, 0),
        title: 'titulo generico',
    });

    const msg3 = Message.build({
        msg_type: 'Alert',
        content: 'Exemplo de mensagem alerta',
        date: new Date(2016, 10, 1, 16, 45, 0, 0),
        title: 'titulo generico',
    });

    const msg4 = Message.build({
        msg_type: 'Manual',
        content: 'Segunda mensagem manual...',
        date: new Date(2016, 10, 1, 16, 45, 0, 0),
        title: 'titulo generico',
    });

    const msg5 = Message.build({
        msg_type: 'Template',
        date: new Date(2016, 10, 1, 16, 45, 0, 0),
        title: 'titulo generico',
    });

    const msg6 = Message.build({
        msg_type: 'Manual',
        content: 'Terceira mensagem manual',
        date: new Date(2016, 10, 1, 16, 45, 0, 0),
        title: 'titulo generico',
    });

    const appUser1 = AppUser.build({
        external_link_id: 5,
        name: 'Diogo',
        last_visit: new Date(2016, 10, 1, 16, 45, 0, 0),
        firebase_token: 'deaQQnWEj5k:APA91bEi1vSZQjd-tAA9bsL6MfOLdWqmGftDWYN5couP3xc6lRcttH5-e0tL_1Hp0IVey1KD_pbHmNsb6Pq_pODqDxBKlbK3hEMkz3tTsQ0fkfuPgVQ5PnX-b0o4nfQ9RNqBLL8hmmyi'
    });

    const appUser2 = AppUser.build({
        external_link_id: 1,
        name: 'João',
        last_visit: new Date(2016, 10, 4, 16, 45, 0, 0),
    });

    const appUser3 = AppUser.build({
        external_link_id: 3,
        name: 'Ines',
        last_visit: new Date(2016, 10, 1, 16, 45, 0, 0),
        firebase_token: 'ckV2oHB7J7o:APA91bGyTiXaK-f2HJyrUY9c-SEWmp03Aox5hTeBxuK2KEzkT-U_vH2CVwPTH3Wv_NbzOjFscrFnpvkqxD8t-9yn6pGClrp7fmah-9PGXwV8knjHC1ZWAqUj1NVmmqejFiJHd6iDtkut'
    });

    const appUser4 = AppUser.build({
        external_link_id: 6,
        name: 'Mariana',
        last_visit: new Date(2016, 10, 1, 16, 45, 0, 0),
        firebase_token: 'fHDQxS-6Jek:APA91bFlmQ1dsC5Ouqf7yJaqswvjR9aLQY4tyI5g-dOpo3Kor4v45VjraVuRbrlXpxf3eK9H0iT-0r3OHmlMYqg0jxHjIVndoJ7ilvO9oE5TGm8Yl4Yh-mzVIBJWS642AkHlBmRgaIQa'
    });

    const appUser5 = AppUser.build({
        external_link_id: 8,
        name: 'Candido',
        last_visit: new Date(2016, 10, 2, 16, 45, 0, 0),
    });

    const appUser6 = AppUser.build({
        external_link_id: 9,
        name: 'Paulo',
        last_visit: new Date(2016, 10, 2, 16, 45, 0, 0),
    });

    const appUser7 = AppUser.build({
        external_link_id: 10,
        name: 'Ana',
        last_visit: new Date(2016, 10, 3, 16, 45, 0, 0),
    });

  const alert1 = Alert.build({
    active: false,
    start_alert: 1
  });

    const temp1 = Template.build({
        name: 'Pagamento proximo da data',
        content: 'O pagamento da mensalidade encontra-se proximo @proxPagamento',
    });

    const temp2 = Template.build({
        name: 'Causa vencedora',
        content: 'A causa vencedora deste mês é: @nomeCausa, @descricaoCausa',
    });


    const temp3 = Template.build({
        name: 'Nova causa',
        content: 'Ex.@name,' +
        ' Este mes temos o prazer de apresentar @nameCausa.',
    });

    Promise.all([msg1.save(), msg2.save(), msg3.save(), msg4.save(), msg5.save(), msg6.save(), temp1.save(), temp2.save(), temp3.save(),
        appUser1.save(), appUser2.save(), appUser3.save(), appUser4.save(), appUser5.save(), appUser6.save(), appUser7.save(), alert1.save()])
        .then(() => {
            temp1.setAlerts([alert1]); // associa alerta a temp
            temp2.setMessages([msg2]); // associa mensagem a temp
            temp3.setMessages([msg5]); // associa mensagem a temp
            appUser1.setMessages([msg1], {seen: true}); // enviar mensagem manual
            appUser1.setMessages([msg4], {seen: true}); // enviar mensagem manual
            appUser3.setMessages([msg6], {seen: false}); // enviar mensagem manual
            msg5.setAppUsers([appUser2, appUser4, appUser5, appUser6, appUser7], {seen: false}); // mesma mensagem template para multiplos utilizadores
        });
    Promise.all([wpUser1.save(), wpUser2.save(), wpUser3.save(), wpUser4.save(), wpUser5.save(),
        wpUser6.save(), wpUser7.save(), wpUser8.save(), wpUser9.save(), wpUser10.save(), wpCauses1.save(),
        wpCauses2.save(), wpCauses3.save(), wpCauses4.save(), wpCauses5.save(), wpCauses6.save(), wpCauses7.save(),
        wpCauses8.save()])
        .then(() => {
            // votacoes deste mes
            wpCauses6.setWpUsers([wpUser1, wpUser3, wpUser5, wpUser6]);
            wpCauses7.setWpUsers([wpUser8, wpUser10]);
            wpCauses8.setWpUsers([wpUser9]);
        });
}


// sincrioniza todas as tabelas
function clear() {
    return sequelize.sync({force:true})
        .catch(()=>{
            return Promise.all([WpCause.truncate(),WpUser.truncate(),UserMsg.truncate()])
        });
}

if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'staging') {
    clear()
        .then(() => {
            populateDB();
        });
}


module.exports = {Admin, AppUser, Template, Alert, Message, WpUser, WpCause, UserMsg, clear};
