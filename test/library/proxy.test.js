var expect = require('chai').expect;

describe('Proxy and Proxy List', function () {
    it('should work correctly with a single proxy', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxy: '123.random.z:9090'
        }, done);
    });

    it('should work correctly with a proxy list', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxyList: 'test/fixtures/files/proxy-list.json'
        }, done);
    });

    it('should work correctly with both a proxy and a proxy list', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxy: '123.random.z:9090',
            proxyList: 'test/fixtures/files/proxy-list.json'
        }, done);
    });

    it('should bail out if proxy list file does not exist', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxyList: 'missing-proxy-list.json' // using an non-existing proxy list
        }, function (err) {
            expect(err).to.exist;
            expect(err.message)
                .to.equal('unable to read the proxy list file "missing-proxy-list.json"');
            done();
        });
    });

    it('should bail out if unable to parse proxy list', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxyList: 'test/library/proxy.test.js' // using an invalid proxy list
        }, function (err) {
            expect(err).to.exist;
            expect(err.message)
                .to.equal('the file at test/library/proxy.test.js does not contain valid JSON data.');
            done();
        });
    });

    it('should bail out if proxy list is not array', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxyList: 'test/fixtures/run/single-get-request.json' // using an invalid proxy list
        }, function (err) {
            expect(err).to.exist;
            expect(err.message).to.equal('expected proxy list to be an array.');
            done();
        });
    });

    it('should bail if proxy list file path is invalid', function (done) {
        newman.run({
            collection: 'test/fixtures/run/single-get-request.json',
            proxyList: {}
        }, function (err) {
            expect(err).to.exist;
            expect(err.message).to.equal('path for proxy list file must be a string');
            done();
        });
    });
});
