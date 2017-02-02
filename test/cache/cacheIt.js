
module.exports = {
  method(next) {
    return next(null, new Date().toString());
  },
  options: {
    cache: (server, pluginOptions) => {
      return {
        expiresIn: 1000,
        generateTimeout: 500
      };
    }
  }
};
