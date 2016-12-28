/**
 * Created by inesa on 04/12/2016.
 */
const expect = require('chai').expect;
const db = require('../database/database.js');
const autoAlerts = require('../database/autoAlerts.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);
chai.use(require('chai-datetime'));
var agent = chai.request.agent(app);

describe('Alert', function () {

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
            nextPayment: new Date(2012, 1, 12, 16, 25, 0, 0),
        });

        const appUser2 = db.AppUser.build({
            external_link_id: 2,
            name: 'Maria',
            last_visit: Date.now(),
            firebase_token: 'fHDQxS-6Jek:APA91bFlmQ1dsC5Ouqf7yJaqswvjR9aLQY4tyI5g-dOpo3Kor4v45VjraVuRbrlXpxf3eK9H0iT-0r3OHmlMYqg0jxHjIVndoJ7ilvO9oE5TGm8Yl4Yh-mzVIBJWS642AkHlBmRgaIQa'
        });
        const wpUser2 = db.WpUser.build({
            name: 'Maria',
            mail: 'maria@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            nextPayment: new Date(2018, 1, 12, 16, 25, 0, 0),
        });

        const alert1 = db.Alert.build({
            id: 1,
            active: true,
            start_alert: 1
        });

        const temp = db.Template.build({
            name: 'Pagamento proximo da data',
            content: 'O pagamento da mensalidade encontra-se proximo @proxPagamento',
        });

        db.clear()
            .then(() => {
                return Promise.all([appUser1.save(), appUser2.save(), wpUser1.save(), wpUser2.save(), alert1.save(), temp.save()])
            }).then(() => {
            temp.setAlerts([alert1]);
        }).then(() => {
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

    it('should return alert from db', (done) => {
        agent
            .get('/alert/api/alert')
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                expect(res.body.alert).not.to.be.null;
                done();
            });
    });

    it('should edit alert from db', (done) => {
        agent
            .put('/alert/api/1')
            .set('Authorization', TOKEN)
            .send({start_alert: '3', active: true})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                db.Alert.findOne({where: {start_alert: '3', active: true}})
                    .then((row) => {
                        if (row) {
                            done();
                        } else {
                            done('Template wasn\'t edited in db');
                        }
                    })
                    .catch((err) => {
                        done(err);
                    })
            });
    });

    it('should return the number of days to warn', (done) => {
        chai.request(app)
            .get('/api/days_to_warn')
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                expect(res.body).to.have.property('days_to_warn');
                expect(res.body.days_to_warn).to.be.equal(1);
                done();
            });
    });

    it('should get all users to notify', (done) => {
        autoAlerts.users2alert(done)
    })
});