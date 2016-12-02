const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);


describe('Authenticate User', function () {

    var token;
    before(function (done) {
        var appUser1 = db.AppUser.build({
            external_link_id: 5,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
        });

        var appUser2 = db.AppUser.build({
            external_link_id: 2,
            name: 'João',
            last_visit: new Date(2016, 10, 4, 16, 45, 0, 0),
        });

        //d9804993f7721f6534380715902e51edce121982c61d6eb939fa94b5ffe33fa476862ce70ae3825b3ff19e12ef61eec9
        var wpUser10 = db.WpUser.build({
            name: 'Ana',
            mail: 'ana@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2016, 11, 4, 13, 25, 0, 0)
        });
        var wpUser5 = db.WpUser.build({
            name: 'Diogo',
            mail: 'diogo@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0)
        });

        var wpUser1 = db.WpUser.build({
            name: 'João',
            mail: 'joao@cenas.pt',
            cellphone: '987654321',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            nextPayment: new Date(2011, 4, 14, 16, 25, 0, 0),
            facebookId: 1319444014767273
        });

        db.clear()
            .then(() =>
                appUser1.save()
            )
            .then(() =>
                appUser2.save()
            )
            .then(() =>
                wpUser5.save()
            )
            .then(() =>
                wpUser1.save()
            )
            .then(() => {
                wpUser10.save();
            })
            .then(() => {
                done();
            })
            .catch(done);
    });

    it('should login a user by return it\'s token', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({mail: 'diogo@cenas.pt', password: '123'})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('token');
                db.AppUser.findOne({where: {token: res.body.token}})
                    .then((user) => {
                        expect(user).to.not.be.null;
                        done();
                    });
            });
    });

    it('should login a user using Facebook', (done) => {
        chai.request(app)
            .post('/api/loginfb')
            .send({
                id: 1319444014767273,
                token: 'EAAC9hDDaHCABAExfih3B6A0Knfgo1TKlPM69WT0HJ8ZAsnmylLBzViiKLrjAsjVCXP0Wj1xc8mZA74xZBBeaCFIbCZAmekKsITWWBZC9etVIZAKq2dbg0AadnwBgq3oJQPpfrgv9D2ZAvlZCmrw1eZBTjCKmmO2m26SYBfoOiDWHg5SNAleoJzmS2hzt0l1KAPzpxG4dLVf1AmZCmQNZB1JCRjoa68f2RgASZAUZD'
            })
            .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('result');
                    expect(res.body.result).to.be.equal('success');
                    db.AppUser.findOne({where: {id: res.body.id}})
                        .then((user)=> {
                            expect(user.token).to.be.string;
                            done();
                        })
                        .catch((err)=>done(err))

                }
            );
    });

    it('should register a user by return it\'s token', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({mail: 'ana@cenas.pt', password: '123'})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('token');
                db.AppUser.findOne({where: {token: res.body.token}})
                    .then((user) => {
                        expect(user).to.not.be.null;
                        token = res.body.token;
                        done();
                    });
            });
    });

    it('should logout a user', (done) => {
        chai.request(app)
            .get('/api/logout')
            .set('Authorization', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                done();
            });
    });
});

describe('Causes', function () {

    const TOKEN = 'd9804993f7721f6534380715902e51edce121982c61d6eb939fa94b5ffe33fa476862ce70ae3825b3ff19e12ef61eec9';

    before((done) => {
        const appUser1 = db.AppUser.build({
            external_link_id: 5,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
            token: TOKEN,
        });
        const wpUser5 = db.WpUser.build({
            name: 'Diogo',
            mail: 'diogo@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0),
        });
        const wpCauses1 = db.WpCause.build({
            name: 'Lar de Infância e Juventude Casa da Criança',
            description: 'A Casa da Criança é um Lar de Infância e Juventude (LIJ) e constitui uma das valências disponibilizadas à comunidade pela Santa Casa da Misericórdia do Peso da Régua (SCMPR). ',
            month: '1',
            winner: true,
            date: new Date(2015, 1, 1, 10, 0, 0, 0),
        });
        const wpCauses2 = db.WpCause.build({
            name: 'ELO SOCIAL - IPSS',
            description: 'Elo Social – Associação para a Integração e Apoio ao Deficiente Jovem e Adulto, é uma Instituição Particular de Solidariedade Social, sediada em Lisboa, considerada Pessoa Coletiva de Utilidade Pública,...',
            month: '10',
            winner: true,
            date: new Date(2015, 10, 15, 11, 10, 0, 0),
        });
        const wpCauses6 = db.WpCause.build({
            name: 'Lar da Boa Vontade',
            description: 'O Lar da Boa Vontade é uma residência adaptada para adultos com deficiência motora. Como tal é necessário a compra de material de Fisioterapia e Terapia Ocupacional, que promova não só a reabilitação motora, mas também as competências sociais e cognitivas dos nossos clientes, para que possam ser os mais independentes e funcionais possível!',
            month: '11',
            winner: false,
            date: new Date(2016, 11, 1, 10, 0, 0, 0),
        });
        const wpCauses7 = db.WpCause.build({
            name: 'Centro Raríssimo da Maia – Centro Multidisciplinar de Reabilitação Intensiva ',
            description: 'O Centro Raríssimo da Maia – Centro Multidisciplinar de Reabilitação Intensiva – presta serviços de saúde de excelência direcionados a portadores de deficiências mentais e raras. ',
            month: '11',
            winner: false,
            date: new Date(2016, 11, 1, 10, 0, 0, 0),
        });
        const wpCauses8 = db.WpCause.build({
            name: 'Elo Social – Associação para a Integração e Apoio às Pessoas com Deficiência Mental',
            description: 'Dado que apoiamos os mais diferentes níveis de deficiência mental – Ligeiro, Moderado, Grave e Profundo, muitos são os problemas físicos e orgânicos associados, sobretudo aos casos de paralisia cerebral e a outros mais dependentes, agudizados com o seu processo de envelhecimento. ',
            month: '11',
            winner: false,
            date: new Date(2016, 11, 1, 10, 0, 0, 0),
        });

        db.clear()
            .then(() =>
                wpCauses1.save()
            )
            .then(() =>
                wpCauses2.save()
            )
            .then(() =>
                wpCauses6.save()
            )
            .then(() =>
                wpCauses7.save()
            )
            .then(() =>
                wpCauses8.save()
            )
            .then(() =>
                appUser1.save()
            )
            .then(() =>
                wpUser5.save()
            )
            .then(() => {
                done();
            })
            .catch(err => done(err));
    })
    ;

    it('should obtain the causes that an user can vote in the current month', (done) => {
        chai.request(app)
            .get('/api/votingCauses')
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                expect(res.body.votacao).to.have.lengthOf(1);
                done();
            });
    });


    it('should obtain all past winner causes', (done) => {
        chai.request(app)
            .get('/api/winnerCauses')
            .query({ano	: 2016})
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                expect(res.body.causes).to.have.lengthOf(1);
                done();
            });
    });
/*
    it('should set a vote from user in a specific cause', (done) => {
        chai.request(app)
            .post('/api/voteCause/125/130')
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });
    */

});

describe('Notification', function () {

    const TOKEN = 'd9804993f7721f6534380715902e51edce121982c61d6eb939fa94b5ffe33fa476862ce70ae3825b3ff19e12ef61eec9';
    before(function (done) {
        var appUser1 = db.AppUser.build({
            external_link_id: 5,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
            token: TOKEN
        });
        var wpUser5 = db.WpUser.build({
            name: 'Diogo',
            mail: 'diogo@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0)
        });
        db.clear()
            .then(function () {
                return appUser1.save();
            })
            .then(function () {
                return wpUser5.save();
            })
            .then(()=>done())
            .catch((err)=>done(err));
    });

    it('should replace the existing token by a new one', (done) => {
        chai.request(app)
            .put('/api/firebaseToken')
            .send({firebaseToken: '123'})
            .set('Authorization', TOKEN)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                db.AppUser.findOne({where: {firebase_token: '123'}})
                    .then((result) => {
                        if (result) {
                            done();
                        } else {
                            done(result);
                        }
                    })
                    .catch(result => done(result));
            });
    });
});
