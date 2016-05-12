'use strict';
const Hapi = require('hapi');
const server = new Hapi.Server({
  debug: {
    log: ['error', 'hapi-method-loader']
  }
});
server.connection({ port: 3000 });

server.register({
  register: require('../'),
  options: {
    verbose: true,
    prefix: 'test'
  }
}, (err) => {
  if (err) {
    console.error('Failed to load a plugin:', err);
    return;
  }
  server.start(() => {
    server.methods.test.doSomething((doSomethingErr, result) => {
      console.log('method result', result);
    });

    console.log('Server running at:', server.info.uri);
  });
});
