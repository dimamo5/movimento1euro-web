var expect  = require('chai').expect;
var db = require('../database/database.js');


describe('Connection', function () {

    this.timeout(50000);

    before(function(done) {
        var appUser1 = db.AppUser.build({
            external_link_id: 5,
            name: 'Diogo',
            last_visit: new Date(2016, 10, 28, 16, 45, 0, 0)
        });

        db.clear()
            .then(function () {
                return appUser1.save()
            })
            .then(function () {
                done();
            })
            .catch(done)

    });

    it('should find user specified (Diogo) in table appUser', function (done) {
        db.AppUser.findOne({where: {name: 'Diogo'}})
            .then(function (res) {
                console.log(res);
                expect(res).to.exist;
                expect(res.external_link_id).to.equal(5);
                expect(res.name).to.equal('Diogo');
                expect(res.last_visit.toString()).to.equal(new Date(2016, 10, 28, 16, 45, 0, 0).toString());//TODO
                done();
            })
    });


});
