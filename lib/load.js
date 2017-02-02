'use strict';
const _ = require('lodash');
const fs = require('fs');
const reqDir = require('directory-files');
const path = require('path');
const loadMethodFromFile = require('./loadMethodFromFile.js');

const defaults = {
  path: `${process.cwd()}${path.sep}methods`,
  verbose: false,
  autoLoad: true
};

module.exports = (server, passedOptions, loadDone) => {
  const settings = _.defaults(passedOptions, defaults);
  settings.path = path.normalize(path.resolve(settings.path));
  // make sure the path exists and is loadable:
  try {
    const stat = fs.statSync(settings.path);
    if (!stat || !stat.isDirectory) {
      server.log(['hapi-method-loader', 'warning'], { path: settings.path, message: 'Not a directory' });
      return loadDone('Not a directory');
    }
  } catch (err) {
    server.log(['hapi-method-loader', 'warning'], { message: err.message });
    return loadDone(err);
  }
  // get all files (at any level) underneath the methods directory:
  reqDir(settings.path).then((hash) => {
    // go through each file, parse it and add it, abort if anything goes awry:
    for (let i = 0; i < hash.length; i++) {
      const file = hash[i];
      // get an array containing the elements of the module:
      const allPathComponents = file.split(path.sep);
      const relativePathSegments = allPathComponents.slice(settings.path.split(path.sep).length, allPathComponents.length);
      let key;
      // if it's in the root methods folder:
      if (relativePathSegments.length === 1) {
        // get the method's name to use as a key in server.methods:
        key = _.camelCase(path.basename(relativePathSegments[0], path.extname(relativePathSegments[0])));
        key = settings.prefix ? `${settings.prefix}.${key}` : key;
      } else {
        // get the method's name (including the path) as a key in server.methods:
        const lastIndex = relativePathSegments.length - 1;
        relativePathSegments[lastIndex] = path.basename(relativePathSegments[lastIndex], path.extname(relativePathSegments[lastIndex]));
        _.each(relativePathSegments, (item, n) => {
          relativePathSegments[n] = _.camelCase(item);
        });
        key = relativePathSegments.join('.');
        key = settings.prefix ? `${settings.prefix}.${key}` : key;
      }
      // finally, add the function to the server:
      if (!_.get(server.methods, key)) {
        // load the executable:
        const method = loadMethodFromFile(file);
        // validate fields:
        Object.keys(method).forEach((propName) => {
          if (['options', 'method'].indexOf(propName) < 0) {
            server.log(['hapi-method-loader', 'error'], `Method imported from ${file} has invalid property "${propName}" `);
          }
        });
        if (settings.verbose) {
          server.log(['hapi-method-loader', 'debug'], { message: 'method loaded', name: key });
        }
        server.method(key, method.method, method.options);
      } else {
        server.log(['hapi-method-loader', 'error'], { message: 'method already exists', key });
      }
    }
    return loadDone();
  });
};