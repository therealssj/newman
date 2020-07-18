var expect = require('chai').expect,
    httpProxy = require('http-proxy'),
    http = require('http'),
    async = require('async');


describe('Proxy requests using PAC', function () {
    var proxyServer, httpServer1, httpServer2;

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

        proxyServer = createProxyServer();

        async.parallel([
            function (cb) {
                httpServer1.listen(8000, cb);
            },
            function (cb) {
                httpServer2.listen(8001, cb);
            },
            function (cb) {
                proxyServer.listen(9000, cb);
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
                proxyServer.close(cb);
            }
        ], function (err) {
            done(err);
        });
    });


    it('should work correctly with a pac file', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--pac test/fixtures/files/example-pac.pac',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should work correctly if there is no match in the pac file', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/single-get-request.json ' +
            '--pac test/fixtures/files/example-pac.pac',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should find a working proxy in the pac file', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--pac test/fixtures/files/example-pac-with-invalid-proxies.pac',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should work correctly if no proxy found in pac file', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-list-request.json ' +
            '--pac test/fixtures/files/example-pac.pac',
        function (code) {
            expect(code, 'should have exit code of 0').to.equal(0);
            done();
        });
    });

    it('should bail out if pac file does not exist', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--pac missing-pac-file.pac',
        function (code) {
            expect(code, 'should not have exit code 0').to.not.equal(0);
            done();
        });
    });

    it('should bail out if unable to parse pac file', function (done) {
        exec('node ./bin/newman.js run test/fixtures/run/proxy-request.json ' +
            '--pac est/cli/pac.test.js',
        function (code) {
            expect(code, 'should not have exit code 0').to.not.equal(0);
            done();
        });
    });
});
