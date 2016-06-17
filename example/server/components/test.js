'use strict'

module.exports = class TestComponent {
  get test() {
    console.log('inside testcomponent\'s test');
    return new Promise(resolve => setTimeout(function() {
      resolve('TTEESSTT');
    }, 500));
  }
};
