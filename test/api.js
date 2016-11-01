var expect = require('chai').expect;
var db = require('../database/database.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
chai.use(chaiHttp);


describe('Authenticate User', function () {

    this.timeout(5000)
    var token;
    before(function (done) {
        var appUser1 = db.AppUser.build({
            external_link_id: 5,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
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

        db.clear()
            .then(function () {
                return appUser1.save();
            })
            .then(function () {
                return wpUser5.save();
            })
            .then(function () {
                wpUser10.save();
            })
            .then(function () {
                done();
            })
            .catch(done)

    });

    it('should login a user by return it\'s token', function (done) {
        chai.request(app)
            .post('/api/login')
            .send({mail: 'diogo@cenas.pt', password: '123'})
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('token');
                db.AppUser.findOne({where: {token: res.body.token}})
                    .then(function (user) {
                        expect(user).to.not.be.null;
                        done();
                    })
            });
    });

    it('should register a user by return it\'s token', function (done) {
        chai.request(app)
            .post('/api/login')
            .send({mail: 'ana@cenas.pt', password: '123'})
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('token');
                db.AppUser.findOne({where: {token: res.body.token}})
                    .then(function (user) {
                        expect(user).to.not.be.null;
                        token = res.body.token;
                        done();
                    })
            });
    });

    it('should logout a user', function (done) {
        chai.request(app)
            .get('/api/logout')
            .set('Authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                console.log(res)
                expect(res).to.be.json;
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                done();
            });


    });
});
