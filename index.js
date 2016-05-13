'use strict';
const _ = require('lodash');
const fs = require('fs');
const defaults = {
  path: `${process.cwd()}/methods`,
  verbose: false,
  autoLoad: true
};
exports.register = (server, options, next) => {
  exports.methodLoader(server, options, next, true);
};
exports.register.attributes = {
  pkg: require('./package.json')
};
exports.methodLoader = function(server, options, next, useAsPlugin) {
  let settings = _.clone(options);
  settings = _.defaults(settings, defaults);

  const addMethod = (folder, key, value, verbose) => {
    key = _.camelCase(key);
    folder = (folder) ? _.camelCase(folder) : '';
    if ((folder && typeof server.methods[folder] !== 'undefined' && typeof server.methods[folder][key] !== 'undefined') || (!folder && typeof server.methods[key] !== 'undefined')) {
      server.log(['hapi-method-loader', 'error'], { message: 'method already exists', folder, key });
      return;
    }
    key = (folder) ? `${folder}.${key}` : key;
    if (typeof value === 'function') {
      value = {
        method: value
      };
    }
    if (verbose) {
      server.log(['hapi-method-loader', 'debug'], { message: 'method loaded', name: key, options: value.options });
    }
    if (value.options) value.options.bind = server;
    else value.options = { bind: server };
    server.method(key, value.method, value.options);//
  };

  const load = (passedOptions, loadDone) => {
    loadDone = loadDone || (() => {});
    settings = _.defaults(settings, defaults);
    fs.stat(settings.path, (err, stat) => {
      if (err) {
        server.log(['hapi-method-loader', 'warning'], { message: err.message });
        return loadDone();
      }
      if (!stat.isDirectory()) {
        server.log(['hapi-method-loader', 'warning'], { path: settings.path, message: 'Not a directory' });
        return loadDone();
      }
      const methods = require('require-all')(settings.path);
      const isFolder = (module) => {
        return (typeof module === 'object' && !module.method);
      };
      const addFile = (file, fileName) => {
        if (options.prefix) {
          addMethod(options.prefix, fileName, file, settings.verbose);
        } else {
          addMethod(false, fileName, file, settings.verbose);
        }
      };
      const addFolder = (folder, folderName) => {
        _.forIn(folder, (module, methodName) => {
          if (options.prefix) {
            addMethod(options.prefix, methodName, module, settings.verbose);
          } else {
            addMethod(folderName, methodName, module, settings.verbose);
          }
        });
      };
      _.forIn(methods, (module, moduleName) => {
        if (isFolder(module)) {
          addFolder(module, moduleName);
        } else {
          addFile(module, moduleName);
        }
      });
      loadDone();
    });
  };
  if (useAsPlugin) {
    server.expose('load', load);
  }
  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);
};
