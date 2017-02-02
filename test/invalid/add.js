module.exports = {
  method: (a, b) => {
    return a + b;
  },
  cache: {
    this: 'not right'
  }
};
