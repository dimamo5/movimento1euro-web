/**
 * Created by inesa on 01/12/2016.
 */
const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);
chai.use(require('chai-datetime'));
var agent = chai.request.agent(app);

describe('History', function () {

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
            title: 'titulo generico',
        });

        const notification2 = db.Message.build({
            msg_type: 'Template',
            content: 'Exemplo de mensagem template',
            date: new Date(2016, 10, 1, 16, 45, 0, 0),
            title: 'titulo generico',
        });

        const notification3 = db.Message.build({
            msg_type: 'Alert',
            content: 'Exemplo de mensagem alerta',
            date: new Date(2016, 10, 1, 16, 45, 0, 0),
            title: 'titulo generico',
        });

        const notification4 = db.Message.build({
            msg_type: 'Manual',
            content: 'Segunda mensagem manual...',
            date: new Date(2016, 10, 1, 16, 45, 0, 0),
            title: 'titulo generico',
        });


        db.clear()
            .then(() => {
                return Promise.all([appUser1.save(), wpUser1.save(), notification1.save(), notification2.save(), notification3.save(), notification4.save()])
            })
            .then(() => {
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

    it('should return all notifications sent to users', (done) => {
        agent
            .get('/api/messages')
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(4);
                done();
            })
    });
});