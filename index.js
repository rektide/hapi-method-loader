var Hoek = require('hoek');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');

var defaults = {
  cwd: process.cwd(),
  methods: 'methods'
};

exports.register = function(server, options, next) {
  var settings = Hoek.clone(options);
  settings = Hoek.applyToDefaults(defaults, settings);

  var methodPath = path.join(settings.cwd, settings.methods);

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

    server.method(key, value.method.bind(server), value.options || {});
  };

  fs.stat(methodPath, function(err, stat) {

    if (err || !stat.isDirectory()) {
      return next();
    }

    var methods = require('require-all')(methodPath);

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
