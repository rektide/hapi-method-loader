'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLoader = require('../');

lab.experiment('hapi-method-loader', () => {
  let server;
  // const url = 'mongodb://localhost:27017/apptics-api-test';
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
        path: `${__dirname}/methods`,
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
    server.start((err) => {
      if (err) {
        console.log(err);
      }
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
    server.start((err) => {
      if (err) {
        console.log(err);
      }
      const result = server.methods.test.add(1, 1);
      Code.expect(typeof result).to.equal('number');
      Code.expect(result).to.equal(2);
      server.stop(() => {
        done();
      });
    });
  });
});
