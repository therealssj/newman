var expect = require('chai').expect;

describe('Proxy requests using PAC', function () {
    it('should work correctly with a valid PAC file', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            pac: 'test/fixtures/files/example-pac.pac'
        }, done);
    });

    it('should bail out if PAC file is missing', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            pac: './missing-pac.pac' // using a non-existing PAC file
        }, function (err) {
            expect(err).to.exist;
            expect(err.message)
                .to.equal('unable to read the PAC file "./missing-pac.pac"');
            done();
        });
    });

    it('should bail out if unable to parse PAC file', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            pac: 'test/library/pac.test.js' // using an invalid PAC file
        }, function (err) {
            expect(err).to.exist;
            expect(err.message)
                .to.equal('the file at test/library/pac.test.js is not a valid PAC file.');
            done();
        });
    });

    it('should bail if PAC file path is invalid', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            pac: {}
        }, function (err) {
            expect(err).to.exist;
            expect(err.message).to.equal('path for PAC file must be a string');
            done();
        });
    });
});
