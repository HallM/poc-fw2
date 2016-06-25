function _resolve(chunk, item) {
  if (item instanceof Function) {
    return item(chunk);
  } else {
    return item;
  }
}

var internal = {
    helper: function() {
      throw new Error('not implement');
    },

    insert: function() {
      throw new Error('not implement');
    },

    each: function(chunk, arr, then, elsethen) {
      var value = _resolve(chunk, arr);
      if (_thenable(value)) {
        return value.then(function(a) {
          return internal.each(new Chunk(), a, then, elsethen);
        });
      }

      if (value && value.length) {
        if (then) {
          value.forEach(function(v, i) {
              if (then instanceof Function) {
                chunk.w(then(chunk, v, i));
              } else {
                chunk.w(then);
              }
          });
        }
      } else {
        if (elsethen) {
          chunk.w(elsethen);
        }
      }
      return chunk;
    },

    if: function(chunk, cond, then, elsethen) {
      var value = _resolve(chunk, cond);
      if (_thenable(value)) {
        return value.then(function(c) {
          return internal.if(new Chunk(), c, then, elsethen);
        });
      }

      if (value) {
        if (then) {
          chunk.w(then);
        }
      } else {
        if (elsethen) {
          chunk.w(elsethen);
        }
      }
      return chunk;
    }
};

function _thenable(item) {
  return item && item.then instanceof Function;
}

function Chunk() {
  this.output = [];
}
Chunk.prototype.w = function w(item) {
  if (item !== this) {
    if (item instanceof Function) {
      this.w(item(this));
    } else {
        this.output.push(item);
    }
  }
  return this;
};
Chunk.prototype.getOutput = function() {
  return Promise
    .all(this.output)
    .then(function(items) {
      return Promise.all(items.map(function(item) {
        if (item instanceof Chunk) {
          return item.getOutput();
        }
        return item;
      }));
    })
    .then(function(items) {
      return items.join('');
    });
};

var template=(function($c,$v,$h,$i){return $c.w("\n").w((function($c,percol){return $c.w("<table>\n").w((function($c,rows){return $c.w($i.each($c,$v.testarray,(function($c,cols,i){return $c.w("<tr>\n      ").w($i.if($c,$v.testcond,(function($c){return $c.w("<td>this should show up!</td>\n      ")}))).w("\n      ").w($i.if($c,i,null,(function($c){return $c.w("<!-- this is the first row  -->\n      ")}))).w("\n      ").w($i.each($c,cols,(function($c,item,j){return $c.w(percol($c,"td",i,j,(function($c){return $c.w("<span>").w(item).w("</span>\n        ")})))}))).w("\n    </tr>\n  ")}),"No rows to show")).w("\n")})($c,[[1,2],[3,4],[5,6]])).w("\n</table>\n").w($v.test).w("\n").w($v.value).w("\n")})($c,(function($c,tag,i,j,item){return $c.w($i.if($c,j,(function($c){return $c.w("<!-- this is the not the first column  -->\n  ")}))).w("\n  <").w(tag).w(">value at row ").w(i).w(" col ").w(j).w(" is ").w(item).w("</").w(tag).w(">\n")}))).w("\n")});

var viewmodel = {
  test: function() {
    return new Promise(function(resolve, reject) {
      resolve('test');
    });
  },

  testarray: function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve([['uno', 'dos'], ['tres', 'quatro'], ['cinco', 'seis']]);
      }, 1000);
    });
  },

  testcond: function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(true);
      }, 1000);
    });
  },

  value: 'easy'
};

var chunk = template(new Chunk(), viewmodel, null, internal);
// console.log(chunk.output)
chunk.getOutput().then(function(output) {
  console.log('out:');
  console.log(output);
});
