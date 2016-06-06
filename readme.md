## hapi-method-loader   [![Build Status](https://travis-ci.org/firstandthird/hapi-method-loader.svg?branch=master)](https://travis-ci.org/firstandthird/hapi-method-loader)

Automatically loads methods from a directory.

### Installation

`npm install hapi-method-loader`

### Usage

```js
server.register({
  register: require('hapi-method-loader'),
  // options: {}
});
```

### Options

 - `cwd` - Defaults to `process.cwd()`
 - `methods` - Relative to `cwd`. Defaults to `methods`

### Methods

Each method should be a file in the `methods` directory. Sub directories may be used for nested methods. File name will dictate method name.

Each method should export a method function and optionally an options object.

Example:

```js
module.exports = {
  method: function(next) {
    return next(null, new Date());
  },
  options: {
    cache: {
      expiresIn: 60 * 60 * 1000
    },
    generateKey: function() {
      return 'getTimeExample';
    }
  }
};
```
