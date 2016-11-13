const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);
var agent = chai.request.agent(app);


describe('Templates', function () {

    before((done) => {
        const temp1 = db.Template.build({
            name: 'Pagamento proximo da data',
            content: 'O pagamento da mensalidade encontra-se proximo @lastpayment',
        });

        const temp2 = db.Template.build({
            name: 'Causa vencedora',
            content: 'A causa vencedora deste mês é: @nomeCausa, @descrição',
        });

        db.clear()
            .then(()=> {
                return Promise.all([temp1.save(), temp2.save()])
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
                    })
            })
            .catch((err)=> {
                done(err)
            })

    });

    it('should get all templates', (done)=> {
        agent
            .get('/template/api/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                expect(res.body.templates).to.be.instanceof(Array);
                expect(res.body.templates).to.have.lengthOf(2);
                expect(res.body.templates[0]).to.have.property('name');
                expect(res.body.templates[0]).to.have.property('content');
                expect(res.body.templates[0]).to.have.property('id');
                done();
            });
    });

    it('should create new templates', (done)=> {
        agent
            .put('/template/api/')
            .send({name: 'ola', content: 'ola @nomecausa'})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body).to.have.property('newTemplate');
                expect(res.body.result).to.be.equal('success');
                expect(res.body.newTemplate.id).to.be.isNumber;
                db.Template.findOne({where: {name: 'ola', content: 'ola @nomecausa'}})
                    .then((row)=> {
                        if (row) {
                            done();
                        } else {
                            done('Template wasn\'t inserted in db');
                        }
                    })
                    .catch((err)=> {
                        done(err);
                    })

            });
    });

    it('should edit templates', (done)=> {
        agent
            .put('/template/api/1')
            .send({name: 'ola1', content: 'olaX @nomecausa'})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.be.equal('success');
                db.Template.findOne({where: {name: 'ola1'}})
                    .then((row)=> {
                        if (row) {
                            done();
                        } else {
                            done('Template wasn\'t edited in db');
                        }
                    })
                    .catch((err)=> {
                        done(err);
                    })

            });
    });

   /* it('should delete templates', (done)=> {
        agent
            .put('/template/api/1')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('removed');
                expect(res.body.removed.id).to.be.equal(1);
            });
    });*/
});
