var _ = require('lodash');
var fs = require('fs');

var defaults = {
  path: process.cwd() + '/methods',
  verbose: false
};

exports.register = function(server, options, next) {
  var settings = _.clone(options);
  settings = _.defaults(settings, defaults);

  var addMethod = function(folder, key, value) {
    key = _.camelCase(key);
    folder = (folder) ? _.camelCase(folder) : '';

    if ((folder && typeof server.methods[folder] != 'undefined' && typeof server.methods[folder][key] != 'undefined') || typeof server.methods[key] !== 'undefined') {
      return;
    }

    key = (folder) ? folder+'.'+key : key;

    if (typeof value == 'function') {
      value = {
        method: value
      };
    }

    if (settings.verbose) {
      server.log(['hapi-method-loader', 'debug'], { message: 'method loaded', name: key, options: value.options });
    }
    server.method(key, value.method.bind(server), value.options || {});
  };

  fs.stat(settings.path, function(err, stat) {

    if (err || !stat.isDirectory()) {
      return next();
    }

    var methods = require('require-all')(settings.path);

    _.forIn(methods, function(value, key) {
      //check if folder
      if (typeof value == 'object' && !value.method) { //assume folder
        _.forIn(value, function(v, k) {
          addMethod(key, k, v);
        });
      } else {
        addMethod(false, key, value);
      }
    });

    next();

  });
};

exports.register.attributes = {
  pkg: require('./package.json')
};
