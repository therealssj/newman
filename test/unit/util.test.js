var sdk = require('postman-collection'),

    util = require('../../lib/util'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    async = require('async');

describe('utility helpers', function () {
    describe('getFullName', function () {
        var collection = new sdk.Collection({
                variables: [],
                info: {
                    name: 'multi-level-folders',
                    _postman_id: 'e5f2e9cf-173b-c60a-7336-ac804a87d762',
                    description: 'A simple V2 collection to test out multi level folder flows',
                    schema: 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
                },
                item: [{
                    name: 'F1',
                    item: [{ name: 'F1.R1' }, { name: 'F1.R2' }, { name: 'F1.R3' }]
                }, {
                    name: 'F2',
                    item: [{
                        name: 'F2.F3',
                        item: [{ name: 'F2.F3.R1' }]
                    },
                    { name: 'F4', item: [] },
                    { name: 'F2.R1' }]
                }, { name: 'R1' }]
            }),
            fullNames = {
                'F1.R1': 'F1 / F1.R1',
                'F1.R2': 'F1 / F1.R2',
                'F1.R3': 'F1 / F1.R3',
                'F2.F3.R1': 'F2 / F2.F3 / F2.F3.R1',
                'F2.R1': 'F2 / F2.R1',
                R1: 'R1',
                F1: 'F1',
                'F2.F3': 'F2 / F2.F3',
                F4: 'F2 / F4',
                F2: 'F2'
            };

        it('should handle empty input correctly', function () {
            expect(util.getFullName(), 'should handle empty input correctly').to.not.be.ok;
            expect(util.getFullName(false), 'should handle `false` input correctly').to.not.be.ok;
            expect(util.getFullName(0), 'should handle `0` input correctly').to.not.be.ok;
            expect(util.getFullName(''), 'should handle `\'\'` input correctly').to.not.be.ok;
            expect(util.getFullName([]), 'should handle `[]` input correctly').to.not.be.ok;
            expect(util.getFullName({}), 'should handle `{}` input correctly').to.not.be.ok;
        });

        it('should handle items correctly', function () {
            collection.forEachItem(function (item) {
                expect(util.getFullName(item)).to.equal(fullNames[item.name]);
            });
        });

        it('should handle item groups correctly', function () {
            collection.forEachItemGroup(function (itemGroup) {
                expect(util.getFullName(itemGroup)).to.equal(fullNames[itemGroup.name]);
            });
        });
    });

    describe('beautifyTime', function () {
        var timings = {
                wait: 1.4010989999997037,
                dns: 0.20460100000036618,
                tcp: 43.05270100000007,
                firstByte: 225.52159900000015,
                download: 7.652700000000095,
                total: 277.628099
            },
            beautifiedTimings = {
                wait: '1ms',
                dns: '204µs',
                tcp: '43ms',
                firstByte: '225ms',
                download: '7ms',
                total: '277ms'
            };

        it('should correctly beautify given timeings object', function () {
            expect(util.beautifyTime(timings)).to.eql(beautifiedTimings);
        });
    });

    describe('isReachable', function () {
        // create a local server and a proxy
        // by creating a local server we do not have to deal with complex request forwarding in the proxy
        var proxy, httpServer;

        function createHttpserver () {
            return http.createServer({}, function (req, res) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('authorized\n');
            });
        }

        function createReverseProxy () {
            const proxy = httpProxy.createProxyServer({});

            return http.createServer(function (req, res) {
                proxy.web(req, res, { target: req.url });
            });
        }

        before(function (done) {
            httpServer = createHttpserver();

            proxy = createReverseProxy();

            async.parallel([
                function (cb) {
                    httpServer.listen(8000, cb);
                },
                function (cb) {
                    proxy.listen(9000, cb);
                }
            ], function (err) {
                done(err);
            });
        });

        after(function (done) {
            async.parallel([
                function (cb) {
                    httpServer.close(cb);
                },
                function (cb) {
                    proxy.close(cb);
                }
            ], function (err) {
                done(err);
            });
        });

        it('should return false for localhost address', function () {
            expect(util.isReachable('localhost:2000', 'http://localhost:2001')).to.eql(false);
        });

        it('should return true for a reachable url through the proxy', function () {
            expect(util.isReachable('localhost:9000', 'http://localhost:8000')).to.eql(false);
        });
    });
});
