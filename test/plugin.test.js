'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLoader = require('../');
const path = require('path');

lab.experiment('hapi-method-loader', () => {
  let server;
  lab.before((done) => {
    server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      }
    });
    server.connection({ port: 3000 });
    server.register({
      register: methodLoader,
      options: {
        verbose: true,
        path: `${__dirname}${path.sep}methods`,
        prefix: 'test'
      },
    }, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      done();
    });
  });
  lab.test(' loads as a plugin, auto-adds a method from a methods directory and lets you call it', (done) => {
    server.start(() => {
      server.methods.test.doSomething((someEerr, result) => {
        Code.expect(typeof result).to.equal('string');
        Code.expect(result).to.equal('something');
        server.stop(() => {
          done();
        });
      });
    });
  });
  lab.test('loads as a plugin, lets you call a method added to a prefixed namespace correctly', (done) => {
    server.start(() => {
      const result = server.methods.test.add(1, 1);
      Code.expect(typeof result).to.equal('number');
      Code.expect(result).to.equal(2);
      server.stop(() => {
        done();
      });
    });
  });
});

lab.experiment('hapi-method-loader cache', { timeout: 5000 }, () => {
  let server;
  lab.before((done) => {
    server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      }
    });
    server.connection({ port: 3000 });
    server.register({
      register: methodLoader,
      options: {
        path: path.join(__dirname, 'methods')
      },
    }, (err) => {
      if (err) {
        throw err;
      }
      done();
    });
  });
  lab.test('supports cacheing', (done) => {
    server.start(() => {
      server.methods.cacheIt((result1) => {
        server.methods.cacheIt((result2) => {
          setTimeout(() => {
            server.methods.cacheIt((result3) => {
              Code.expect(result1).to.equal(result2);
              Code.expect(result2).to.not.equal(result3);
              done();
            });
          }, 3000);
        });
      });
    });
  });
});
