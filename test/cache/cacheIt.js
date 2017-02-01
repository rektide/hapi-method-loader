
module.exports = {
  method(val1, callback) {
    const val2 = val1;
    return callback(new Date());
  },
  options: {
    cache: (server, pluginOptions) => {
      return {
        name: 'mongoCache',
        cache: 'cache2',
        generateTimeout: 2000
      };
    }
  }
};
