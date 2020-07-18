var expect = require('chai').expect,
    httpProxy = require('http-proxy'),
    http = require('http'),
    async = require('async');


describe('Proxy and Proxy List', function () {
    var proxyServer1, proxyServer2, httpServer1, httpServer2;

    function createHttpserver () {
        return http.createServer({}, function (req, res) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('authorized\n');
        });
    }

    function createProxyServer () {
        const proxy = httpProxy.createProxy({});

        return http.createServer(function (req, res) {
            proxy.web(req, res, { target: req.url });
        });
    }

    before(function (done) {
        httpServer1 = createHttpserver();
        httpServer2 = createHttpserver();

        proxyServer1 = createProxyServer();
        proxyServer2 = createProxyServer();

        async.parallel([
            function (cb) {
                httpServer1.listen(8000, cb);
            },
            function (cb) {
                httpServer2.listen(8001, cb);
            },
            function (cb) {
                proxyServer1.listen(9000, cb);
            },
            function (cb) {
                proxyServer2.listen(9001, cb);
            }
        ], function (err) {
            done(err);
        });
    });

    after(function (done) {
        async.parallel([
            function (cb) {
                httpServer1.close(cb);
            },
            function (cb) {
                httpServer2.close(cb);
            },
            function (cb) {
                proxyServer1.close(cb);
            },
            function (cb) {
                proxyServer2.close(cb);
            }
        ], function (err) {
            done(err);
        });
    });


    it('should work correctly with a single proxy', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json --proxy http://localhost:9000',
            function (code) {
                expect(code, 'should have exit code of 0').to.equal(0);
                done();
            });
    });

    it('should work correctly with a proxy list', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-list-request.json ' +
            '--proxy-list test/fixtures/files/proxy-list.json',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should use proxy from list when both proxy options are used', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-list-request.json ' +
            '--proxy-list test/fixtures/files/proxy-list.json --proxy http://localhost:9000',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should fallback to proxy when no match in proxy list', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--proxy-list test/fixtures/files/proxy-list.json --proxy http://localhost:9000',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should bail out if proxy list file does not exist', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--proxy-list missing-proxy-file.json',
        function (code) {
            expect(code, 'should not have exit code 0').to.not.equal(0);
            done();
        });
    });

    it('should bail out if unable to parse proxy list', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--proxy-list test/cli/proxy.test.js', // use test file itself as an invalid proxy list
        function (code) {
            expect(code, 'should not have exit code 0').to.not.equal(0);
            done();
        });
    });

    it('should bail out if proxy list is not array', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--proxy-list test/fixtures/run/proxy-request.json', // pass single test case as proxy list
        function (code) {
            expect(code, 'should not have exit code 0').to.not.equal(0);
            done();
        });
    });
});
