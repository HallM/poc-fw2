function decor(thing: String) {
  return function(constructor: Function) {
    console.log('thing:', thing);
  };
}

function decorFn(thing: String) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = function() {
      console.log('decor fn:', thing);
      fn();
    };
  };
}

@decor('Hello')
class Test {
  constructor() {
    console.log('constructed');
  }

  @decorFn('World')
  async test() {
    console.log('this was a test');
  }
}

console.log('start');
let thing = new Test();

console.log('make call');
thing.test();

console.log('done');
