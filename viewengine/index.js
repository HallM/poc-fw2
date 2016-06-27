var compiler = require('./compiler');
//var Bluebird = require('bluebird');
// var AsyncWriter = require('async-writer');

function _resolve(item) {
  if (item instanceof Function) {
    return item();
  } else {
    return item;
  }
}

var htmlTest = /[&<>\"\'\n]/;
var htmlReplace = /[&<>\"\'\n]/g;
var replacements = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '\n': '&#10;' //Preserve new lines so that they don't get normalized as space
};

function replaceChar(match) {
    return replacements[match];
}

var internal = {
    escapeHtml: function escapeXmlAttr(str) {
        if (typeof str === 'string') {
            return htmlTest.test(str) ? str.replace(htmlReplace, replaceChar) : str;
        }

        return (str == null) ? '' : str.toString();
    },

    eq: function(l, r) {
      return _resolve(l) == _resolve(r);
    },

    neq: function(l, r) {
      return _resolve(l) != _resolve(r);
    },

    lt: function(l, r) {
      return _resolve(l) < _resolve(r);
    },

    gt: function(l, r) {
      return _resolve(l) > _resolve(r);
    },

    lte: function(l, r) {
      return _resolve(l) <= _resolve(r);
    },

    gte: function(l, r) {
      return _resolve(l) >= _resolve(r);
    },

    cmpand : function(l, r) {
      return _resolve(l) && _resolve(r);
    },

    cmpor: function(l, r) {
      return _resolve(l) || _resolve(r);
    },

    add: function(l, r) {
      return _resolve(l) + _resolve(r);
    },

    sub: function(l, r) {
      return _resolve(l) - _resolve(r);
    },

    mul: function(l, r) {
      return _resolve(l) * _resolve(r);
    },

    div: function(l, r) {
      return _resolve(l) / _resolve(r);
    },

    mod: function(l, r) {
      return _resolve(l) % _resolve(r);
    },

    insert: function() {
      throw new Error('not implement');
    },

    each: function(arr, then, elsethen) {
      var value = _resolve(arr);
      // if (_thenable(value)) {
      //   return value.then(function(a) {
      //     return internal.each(new Chunk(), a, then, elsethen);
      //   });
      // }

      var totalLen = 0;
      if (value && (totalLen = value.length)) {
        if (then) {
          var chunk = new Chunk();
          var i = 0;
          for (; i < totalLen; i++) {
              if (then instanceof Function) {
                chunk.w(then(value[i], i));
              } else {
                chunk.w(then);
              }
          }
          return chunk.getOutput();
          // value.forEach(function(v, i) {
          //     if (then instanceof Function) {
          //       chunk.w(then(chunk, v, i));
          //     } else {
          //       chunk.w(then);
          //     }
          // });
        }
      } else {
        if (elsethen) {
          return _resolve(elsethen);
        }
      }
      return '';
      // return chunk;
    },

    if: function(cond, then, elsethen) {
      var value = _resolve(cond);
      // if (_thenable(value)) {
      //   return value.then(function(c) {
      //     return internal.if(new Chunk(), c, then, elsethen);
      //   });
      // }

      if (value) {// == false
        if (then) {
          return _resolve(then);
        }
      } else {
        if (elsethen) {
          return _resolve(elsethen);
        }
      }
      return '';
    }
};

function _thenable(item) {
  return item && item.then instanceof Function;
}

function Chunk() {
  this.output = '';
  // this.writer = AsyncWriter.create();
}
Chunk.prototype.w = function w(item) {
  this.output += _resolve(item);
  // if (item instanceof Function) {
  //   // this.c(item, [this]);
  //   this.w(item());
  // } else {
  //     this.output += item;
  //     // this.writer.w(item);
  // }
  // return this;
};
// Chunk.prototype.c = function c(fn, args) {
//   fn.apply(null, args);
//   // return this;
// };
Chunk.prototype.getOutput = function() {
  return this.output;
//   return Bluebird
//     .all(this.output)
//     .then(function(items) {
//       return Bluebird.all(items.map(function(item) {
//         if (item instanceof Chunk) {
//           return item.getOutput();
//         }
//         return item;
//       }));
//     })
//     .then(function(items) {
//       return items.join('');
//     });
    // return Bluebird.resolve(this.output);
};

var helpers = {};

function addHelper(name, fn) {
  helpers[name] = fn;
}

function render(template, viewmodel, callback) {
    var output = template(Chunk, viewmodel, helpers, internal);
    // chunk.getOutput().then(function(output) {
    //     // console.log('out:');
    //     // console.log(output);
    //     // throw new Error('');
    //     callback(null, output);
    //     // console.log(output);
    // });
    callback(null, output);
    // callback(null, chunk.writer.getOutput());
}

module.exports = {
    compile: compiler,
    render: render,
    addHelper: addHelper
};
