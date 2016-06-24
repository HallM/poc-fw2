var internal = {
    "helper": function() {
      throw new Error('not implement');
    },

    "insert": function() {
      throw new Error('not implement');
    },

    "define": function() {
      throw new Error('not implement');
    },

    "each": function(chunk, arr, then, elsethen) {
      if (arr && arr.length) {
        if (then) {
          arr.forEach(function(v, i) {
              if (then instanceof Function) {
                chunk.w(then(chunk, v, i));
              } else {
                chunk.w(then);
              }
          });
        }
      } else {
        if (elsethen) {
          if (elsethen instanceof Function) {
            chunk.w(elsethen(chunk));
          } else {
            chunk.w(elsethen);
          }
        }
      }
      return chunk;
    },

    "if": function(chunk, cond, then, elsethen) {
      if (cond) {
        if (then) {
          if (then instanceof Function) {
            chunk.w(then(chunk));
          } else {
            chunk.w(then);
          }
        }
      } else {
        if (elsethen) {
          if (elsethen instanceof Function) {
            chunk.w(elsethen(chunk));
          } else {
            chunk.w(elsethen);
          }
        }
      }
      return chunk;
    }
};

var output = '';
function Chunk() {
  this.output = [];
}
Chunk.prototype.w = function w(item) {
  if (item instanceof Function) {
    this.w(item(this));
  } else if (item instanceof Chunk) {
    if (item !== this) {
      this.output = this.output.concat(item.output);
    }
  } else {
    this.output.push(item);
  }
  return this;
};
Chunk.prototype.getOutput = function() {
  return this.output.join('');
}

var template =(function($c) {return $c.w("\n").w((function($c,percol) {return $c.w("<table>\n").w((function($c,rows) {return $c.w(internal.each($c,rows,(function($c,cols,i) {return $c.w("<tr>\n      ").w(internal.if($c,i,null,(function($c) {return $c.w("<!-- this is the first row  -->\n      ")}))).w("\n      ").w(internal.each($c,cols,(function($c,item,j) {return $c.w(percol($c,"td",i,j,(function($c) {return $c.w("<span>").w(item).w("</span>\n        ")})))}))).w("\n    </tr>\n  ")}),"No rows to show")).w("\n")})($c,[[1,2],[3,4],[5,6]])).w("\n</table>\n")})($c,(function($c,tag,i,j,item) {return $c.w(internal.if($c,j,(function($c) {return $c.w("<!-- this is the not the first column  -->\n  ")}))).w("\n  <").w(tag).w(">value at row ").w(i).w(" col ").w(j).w(" is ").w(item).w("</").w(tag).w(">\n")}))).w("\n")});

var chunk = template(new Chunk());
console.log(chunk.getOutput());
