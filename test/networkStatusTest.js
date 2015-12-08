/*global describe, it, Promise */

import expect from 'expect.js';
import { networkStatus, monitorForReConnect } from '../src/networkStatus';

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.Promise = require('es6-promise').Promise;

describe("network status", () => {
    it("should be reachable", done => {
        networkStatus('http://example.org')
            .then(reachable => expect(reachable).to.be.equal(true))
            .then(_ => done())
            .catch(error => done(error));
    });

    it("should NOT be reachable", done => {
        networkStatus('http://doesnt-exist.example.org')
            .then(_ => done(new Error('should not have network connection')))
            .catch(error => done());
    });
});

describe("monitor for re-connecting to the network", () => {
    let networkStatusCall;
    const networkStatusMock = () => {
        networkStatusCall++;

        if (networkStatusCall == 10) {
            return Promise.resolve(true);
        }

        return Promise.reject(new Error('Network not reachable'));
    };

    beforeEach(() => {
        networkStatusCall = 0;
    });

    it("should retry to connect to the network", done => {
        networkStatusMock()
            .then(_ => done(new Error('network should be unreachable')))

            .catch(error => monitorForReConnect({networkStatus: networkStatusMock, delay: 5}))

            .then(reachable => {
                expect(reachable).to.be.equal(true);
                expect(networkStatusCall).to.be.equal(10);
            })
            .then(_ => done())
            .catch(error => done(error));
    });

    it("should give up on trying to connect to the network", done => {
        networkStatusMock()
            .then(_ => done(new Error('network should be unreachable')))

            .catch(error => monitorForReConnect({networkStatus: networkStatusMock, delay: 5, maxRetries: 5}))
            .then(_ => done(new Error('should have given up')))

            .catch(error => {
                expect(error.message).to.be.equal('Maximum(5) retries reached');
                expect(networkStatusCall).to.be.equal(5+1);
            })
            .then(_ => done())
            .catch(error => done(error));
    });
});
