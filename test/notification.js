/**
 * Created by inesa on 15/11/2016.
 */
const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);
var agent = chai.request.agent(app);

describe('Notifications', function () {

    const TOKEN = 'd9804993f7721f6534380715902e51edce121982c61d6eb939fa94b5ffe33fa476862ce70ae3825b3ff19e12ef61eec9';

    before((done) => {

        const appUser1 = db.AppUser.build({
            external_link_id: 1,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
            token: TOKEN,
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

        db.clear()
            .then(() =>
                appUser1.save()
            )
            .then(() =>
                wpUser1.save()
            )
            .then(() =>
                notification1.save()
            )
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
            .post('/notifications/sendManual')
            .send({
                msg_type: 'Manual',
                content: 'Exemplo de mensagem manual',
                ids: [1],
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('map_response');
            }) //TODO:  keep doing this

m
    });


});