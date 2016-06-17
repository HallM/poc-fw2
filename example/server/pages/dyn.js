'use strict'

class Test {
  get dynamicthing() {
    console.log('test');
    return Promise.resolve('MMAAATTTEEEEOOOO');
  }
  get otherthing() {
    console.log('should not show up');
    return 'noooo';
  }
}

module.exports = function *(req, res, next) {
  var t = new Test();
  return t;
}
