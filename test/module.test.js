'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLoader = require('../').methodLoader;

lab.experiment('hapi-method-loader', () => {
  let server;
  lab.before((done) => {
    server = new Hapi.Server();
    server.connection();
    // var url = 'mongodb://localhost:27017/apptics-api-test';
    done();
  });

  lab.test('loads as a module, auto-adds a method from a methods directory and lets you call it', (done) => {
    methodLoader(server, {
      verbose: true,
      path: `${__dirname}/methods`
    },
    () => {
      server.start(() => {
        server.methods.doSomething((err, result) => {
          Code.expect(typeof result).to.equal('string');
          Code.expect(result).to.equal('something');
          done();
        });
      });
    });
  });

  lab.test('loads as a module, lets you call a method added to a prefixed namespace correctly', (done) => {
    methodLoader(server, {
      path: `${__dirname}/methods`,
      prefix: 'test'
    },
    () => {
      server.start(() => {
        const result = server.methods.test.add(1, 1);
        Code.expect(typeof result).to.equal('number');
        Code.expect(result).to.equal(2);
        done();
      });
    });
  });
});
