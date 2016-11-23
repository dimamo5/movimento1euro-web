/**
 * Created by inesa on 15/11/2016.
 */
const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);
chai.use(require('chai-datetime'));
var agent = chai.request.agent(app);

describe('Notifications', function () {

    const TOKEN = 'd9804993f7721f6534380715902e51edce121982c61d6eb939fa94b5ffe33fa476862ce70ae3825b3ff19e12ef61eec9';
    before((done) => {

        const appUser1 = db.AppUser.build({
            external_link_id: 1,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
            token: TOKEN,
            firebase_token: 'fHDQxS-6Jek:APA91bFlmQ1dsC5Ouqf7yJaqswvjR9aLQY4tyI5g-dOpo3Kor4v45VjraVuRbrlXpxf3eK9H0iT-0r3OHmlMYqg0jxHjIVndoJ7ilvO9oE5TGm8Yl4Yh-mzVIBJWS642AkHlBmRgaIQa',
        });
        const wpUser1 = db.WpUser.build({
            name: 'Diogo',
            mail: 'diogo@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0),
        });

        const notification1 = db.Message.build({
            msg_type: 'Manual',
            content: 'Exemplo de mensagem manual',
            date: new Date(2016, 10, 1, 16, 45, 0, 0),
        });

        const notification2 = db.Message.build({
            msg_type: 'Template',
            content: 'Exemplo de mensagem template',
            date: new Date(2016, 10, 1, 16, 45, 0, 0),
        });

        db.clear()
            .then(() => {
                return Promise.all([appUser1.save(), wpUser1.save(), notification1.save()])
            })
            .then(()=> {
                return db.Admin.findOrCreate({
                    where: {username: 'root'},
                    defaults: {
                        username: 'root',
                        name: 'root',
                        password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
                    },
                });
            })
            .then(() => {
                agent
                    .post('/process_login')
                    .send({username: 'root', password: 'admin'})
                    .end(function () {
                        done();
                    });
            })
            .catch(err => done(err));
    });

    it('should send a message notification to a unique user', (done) => {
        agent
            .post('/notification/sendManual')
            .send({
                msg_type: 'Manual',
                title: 'Duarte',
                content: 'Exemplo de mensagem manual',
                ids: [1],
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.equal('success');
                expect(res.body).to.have.property('users');
                expect(res.body).to.have.property('msg_id');
                expect(res.body).to.have.property('notificationStates');

                console.log(res.body.users[0], res.body.notificationStates[0]);

                db.UserMsg.findOne({where: {App: res.body.users[0], messageId: res.body.msg_id}})
                    .then((message)=> {
                        expect(message).to.not.be.null;
                        expect(message.dataValues.createdAt).to.equalDate( new Date());
                        done();
                    })
            });

    });

    /*
     it('should send a manual msg to multiple users' , (done) => {
     .post('/notification/sendManual')
     .send({
     msg_type: 'Manual',
     title: 'Duarte',
     content: 'Exemplo de mensagem manual',
     ids: [1],
     })
     }*/

    /* it('should send a template msg to multiple users', (done) => {
     agent

     .post('/notification/sendTemplate')
     .send({
     msg_type: 'Manual',
     title: 'Duarte',
     content: 'Exemplo de mensagem manual',
     ids: [1],
     })
     .end((err, res) => {
     expect(err).to.be.null;
     expect(res).to.have.status(200);
     expect(res).to.be.json;
     expect(res.body).to.have.property('result');
     expect(res.body.result).to.equal('success');
     expect(res.body).to.have.property('users');
     expect(res.body).to.have.property('msg_id');
     expect(res.body).to.have.property('notificationStates');

     db.UserMsg.findOne({where: {AppUserId: res.body.users[0], messageId: res.body.msg_id}})
     .then((message)=> {
     expect(message).to.not.be.null;
     done();
     })
     });
     });*/
});