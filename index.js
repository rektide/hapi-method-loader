var _ = require('lodash');
var fs = require('fs');

var defaults = {
  path: process.cwd() + '/methods',
  verbose: false
};

exports.register = function(server, options, next) {

  var addMethod = function(folder, key, value, verbose) {
    key = _.camelCase(key);
    folder = (folder) ? _.camelCase(folder) : '';

    if ((folder && typeof server.methods[folder] != 'undefined' && typeof server.methods[folder][key] != 'undefined') || (!folder && typeof server.methods[key] !== 'undefined')) {
      server.log(['hapi-method-loader', 'error'], { message: 'method already exists', folder: folder, key: key });
      return;
    }

    key = (folder) ? folder+'.'+key : key;

    if (typeof value == 'function') {
      value = {
        method: value
      };
    }

    if (verbose) {
      server.log(['hapi-method-loader', 'debug'], { message: 'method loaded', name: key, options: value.options });
    }
    server.method(key, value.method.bind(server), value.options || {});
  };

  var load = function(options, next) {
    var settings = _.clone(options);
    next = next || function() {};
    settings = _.defaults(settings, defaults);
    fs.stat(settings.path, function(err, stat) {

      if (err) {
        return next(err);
      }

      if (!stat.isDirectory()) {
        return next();
      }

      var methods = require('require-all')(settings.path);

      _.forIn(methods, function(value, key) {
        //check if folder
        if (typeof value == 'object' && !value.method) { //assume folder
          _.forIn(value, function(v, k) {
            addMethod(key, k, v, settings.verbose);
          });
        } else {
          addMethod(false, key, value, settings.verbose);
        }
      });

      next();

    });
  };

  server.expose('load', load);
  load(options, next);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
