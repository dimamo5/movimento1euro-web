const expect = require('chai').expect;
const db = require('../database/database.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);

describe('Users', function () {
  this.timeout(25000);
  before((done) => {
    const appUser1 = db.AppUser.build({
      external_link_id: 3,
      name: 'Diogo',
      last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
    });

    const appUser2 = db.AppUser.build({
      external_link_id: 2,
      name: 'João',
      last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
    });

    const appUser3 = db.AppUser.build({
      external_link_id: 3,
      name: 'Ines',
      last_visit: new Date(2016, 10, 28, 16, 45, 0, 0),
    });
    const wpUser1 = db.WpUser.build({
      name: 'João',
      mail: 'joao@cenas.pt',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      lastPayment: new Date(2011, 4, 14, 16, 25, 0, 0),
    });

    const wpUser2 = db.WpUser.build({
      name: 'Ines',
      mail: 'ines@cenas.pt',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      lastPayment: new Date(2013, 9, 23, 16, 25, 0, 0),
    });

    const wpUser3 = db.WpUser.build({
      name: 'Diogo',
      mail: 'diogo@cenas.pt',
      password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      lastPayment: new Date(2012, 1, 12, 16, 25, 0, 0),
    });
    Promise.all([db.clear(), appUser1.save(), appUser2.save(), appUser3.save(), wpUser1.save(), wpUser2.save(), wpUser3.save()])
            .then(() => {
              done();
            })
            .catch(err => done(err));
  });

  it('should obtain all the users in the system', (done) => {
    chai.request(app)
            .get('/user/api/users')
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              db.WpUser.count()
                    .then((numberRecords) => {
                      expect(res.body).to.be.lengthOf(numberRecords);
                      expect(res.body[0]).to.have.property('appUserID');
                      done();
                    });
            });
  });
});
