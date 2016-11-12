const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);

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

        Promise.all([temp1.save(), temp2.save()])
            .then(() => {
                done();
            })
            .catch((err)=> {
                done(err)
            })

    });

    it('should get all templates', (done)=> {
        chai.request(app)
            .get('/templates/api/')
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
        chai.request(app)
            .put('/templates/api/')
            .send({name: 'ola', content: 'ola @nomecausa'})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body).to.have.property('id');
                expect(res.body.result).to.be.equal('success');
                expect(res.body.id).to.be.instanceof(Number);
                done();
            });
    });
});
