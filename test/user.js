const expect = require('chai').expect;
const db = require('../database/database.js');
const apiWrapper = require('../database/api_wrapper');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);

describe('Users', function () {
    before((done) => {
        const appUser1 = db.AppUser.build({
            external_link_id: 3,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
        });

        const appUser2 = db.AppUser.build({
            external_link_id: 2,
            name: 'Ines',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
        });
        const wpUser1 = db.WpUser.build({
            id: 1,
            name: 'João',
            mail: 'joao@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2011, 4, 14, 16, 25, 0, 0),
        });

        const wpUser2 = db.WpUser.build({
            id: 2,
            name: 'Ines',
            mail: 'ines@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2013, 9, 23, 16, 25, 0, 0),
        });

        const wpUser3 = db.WpUser.build({
            id: 3,
            name: 'Diogo',
            mail: 'diogo@cenas.pt',
            password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0),
        });

        db.clear()
            .then(()=> {
                return Promise.all([appUser1.save(), appUser2.save(), wpUser1.save(), wpUser2.save(), wpUser3.save()])
            })
            .then(() => {
                done();
            })
            .catch((err) => done(err));
    });

    it('should obtain all the users in the system', function (done) {
        apiWrapper.getUsersInfo()
            .then((data)=> {
                expect(data).to.not.be.null;
                expect(data).to.have.lengthOf(2);
                expect(data[0]).to.have.property('mail');
                done()
            })
            .catch((err)=>(done(err)));
    });

})
;
