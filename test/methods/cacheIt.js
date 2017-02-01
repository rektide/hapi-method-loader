
module.exports = {
  method(callback) {
    return callback(new Date());
  },
  // options: {
  //   cache: (server, pluginOptions) => {
  //     return {
  //       expiresIn: 2 * 1000
  //     };
  //   }
  // }
};
