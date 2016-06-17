'use strict'

class Test {
  get dynamicthing() {
    console.log('test');
    return new Promise(resolve => setTimeout(function() {
      resolve('lazy loading');
    }, 1000));
    // return Promise.resolve('MMAAATTTEEEEOOOO');
  }
  get otherthing() {
    console.log('should not show up');
    return 'noooo';
  }
  afunction() {
    console.log('will show up');
    return new Promise(resolve => setTimeout(function() {
      resolve('much late');
    }, 5000));
  }
}

module.exports = function *(req, res, next) {
  var t = new Test();
  return t;
}
