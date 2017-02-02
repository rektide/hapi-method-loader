'use strict';
const load = require('./lib/load.js');

// can be used as a module import::
exports.methodLoader = function(server, options, next, useAsPlugin) {
  if (useAsPlugin) {
    server.expose('load', load);
  }
  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);
};

// can be used as a hapi plugin:
exports.register = (server, options, next) => {
  exports.methodLoader(server, options, next, true);
};
exports.register.attributes = {
  pkg: require('./package.json')
};
