'use strict';

// const sample = `
// {def percol {:
//   <td>value at row {i} col {j} is {item}</td>
// }}

// <table>
// {#rows {+ {:
//     <tr>
//       {#row
//         {+percol i=i j=idx}
//       }
//     </td>
//   } i=idx}
// }
// </table>
// `;

/*
const sample = `
{define percol={begin
  {! an if can just define an else case, it's fine !}
  {if cond=j else={begin
    <!-- this is the not the first column  -->
  }}
  <{tag}>value at row {i} col {j} is {item}</{tag}>
}}

<table>
{each items=rows then={{begin
    <tr>
      {! an if is much like any other call !}
      {if cond=i then={begin
        <!-- this is the first row  -->
      }}
      {! the item used here is from the each-rows !}
      {each items=item
        {! only params go to the call-context, so we pass item, but as an anon-block !}
        then={percol j=idx mytag="td" item={begin
          {! this item is from the each-item, not the each-rows !}
          <span>{item}</span>
        }}
      }
    </td>
  } i=idx}
else={"No rows to show"}}
</table>
`;
*/

/**/
const sample = `
{{body (percol)
<table>
{{body (rows)
{each rows {body (cols i)
    <tr>
      {if i {} {body
        <!-- this is the first row  -->
      }}
      {each cols {body (item j)
        {percol "td" i j {body
          {! item is the default var name for the each !}
          <span>{item}</span>
        }
      }}
      }
    </tr>
  }
"No rows to show"}
} ((1 2) (3 4) (5 6))}
</table>
} {body (tag i j item)
  {if j {body
    <!-- this is the not the first column  -->
  }}
  <{tag}>value at row {i} col {j} is {item}</{tag}>
}}
`;
/**/

const SyntaxError = require('./schemey').SyntaxError;
const parser = require('./schemey').parse;

/*
things done during processing:
combine multiple format + buffers into a single buffer
remove comments

start block is always called after declaration

expressions:
body (begin) -> basically is an anonymous function/body
get (any expression, so could be param-less function)
call
// flow
raw
escape

other
block
literal
identifier -> may have a ctx (could be null to) and path
param -> left is just a key, right is an expression
filter -> becomes a fn wrapper for var access
variable -> left is the ctx, right is the identifier in that ctx
            ctx is (empty), viewmodel, string

internal functions
    = "helper"
    / "insert"
    / "define"
    = "each"
    / "if"
    / "ifnot"

i also have some special identifiers like
messages:myprop
to get something from the strings file for localization.

viewmode:field
will get field from viewmodel, mostly useful if {field} gets overridden,
that you know what you asked for is coming from the viewmodel.
*/

// function Scope() {
//   this.vars = {};
// }
// Scope.prototype.addToScope = function(key) {
//   var index = this.findInScope(key);
//   if (index === -1) {
//     this.vars.push([key, null]);
//   }
// };
// Scope.prototype.findInScope = function(key) {
//   return this.vars.findIndex(function(item) {
//     return item[0] === key;
//   });
// };

// function SymbolTable() {
//   this.scopes = [];
// }
// SymbolTable.prototype.pushScope = function(keys) {
//   var newScope = new Scope();
//   if (keys && keys.length) {
//     keys.forEach(newScope.addToScope);
//   }
//   this.scopes.splice(0, 0, newScope);
// };
// SymbolTable.prototype.findAddress = function(key) {
//   var address = null;

//   this.scopes.forEach(function(scope, scopeIndex) {
//     var index = scope.findInScope(key);
//     if (index !== -1) {
//       address = [scopeIndex, index];
//     }
//   });

//   // if not set, assume it's in the viewmodel
//   return address;
// };


function processblock(b) {
  // could be format, buffer, null(comment), or expression
  console.log('block');
  var output = '';

  var bLen = b.length;
  var prevBuff = '';

  b.forEach(function(e, indx) {
    var type = e[0];
    if (!type) {
      output += '';
    } else if (type === 'format' || type === 'buffer') {
      // do a look ahead
      prevBuff += e[1];
      if (indx+1 < bLen && (b[indx+1][0] === 'format' || b[indx+1][0] === 'buffer')) {
      } else {
        output += '.w("' + prevBuff + '")';
        prevBuff = '';
      }
    } else {
      output += processexp(e);
    }
  });

  return output;
}
function processexp(e) {
  console.log('exp');
  var type = e[0];
  if (!type) {
    throw new Error('uhhh, fail no type ' + e);
  } if (type === 'body') {
    return processbody(e[1]);
  } else if (type === 'get') {
    return processget(e[1]);
  } else if (type === 'call') {
    return processcall(e[1]);
  } else if (type === 'raw') {
    return processraw(e[1]);
  } else if (type === 'escape') {
    return processescape(e[1]);
  } else if (type === 'identifier') {
    return processidentifier(e[1]);
  } else if (type === 'literal') {
    return processliteral(e[1]);
  } else if (type === 'array') {
    return processarray(e[1]);
  } else if (type === 'empty') {
    return processempty();
  } else {
    throw new Error('unknown thing ' + e);
  }
}
function processcallable(c) {
  console.log('callable');
  var type = c[0];
  if (!type) {
    throw new Error('no callable type ' + c);
  } if (type === 'body') {
    return processbody(c[1]);
  } else if (type === 'identifier') {
    return processidentifier(c[1]);
  } else if (type === 'internal') {
    return processinternal(c[1]);
  } else {
    throw new Error('unknown callable ' + c);
  }
}

function processinternal(v) {
  return 'internal.' + v[0];
}

function processidentifier(v) {
  console.log('identifier');
  var ctx = v.length === 2 ? v.shift() : null;
  var name = v.shift();

  if (ctx) {
    throw new Error('contexts not supported yet');
  }

  return name;
}
function processliteral(v) {
  return v[0];
}
function processarray(v) {
  console.log('array');
  var arr = v[0];
  var output = '[';
  output += arr.map(function(e) {
     return processexp(e);
  }).join(',');
  output += ']';

  return output;
}
function processempty() {
  return 'null';
}

  function processbody(v) {
    console.log('body');
    var params = v.length === 2 ? v.shift() : null;
    var block = v.shift();

    if (v.length) {
      // something went wrong
    }

    var output = '(function($c';
    if (params) {
      output += ',';
      output += params.map(function(p) {
        return p;
      }).join(',');
    }
    output += ') {return $c'

    if (!block || block[0] !== 'block' || !block[1]) {
      throw new Error('Invalid block in a body');
    }

    output += processblock(block[1]);
    output += '})';
    return output;
  }

  function processget(v) {
    console.log('get');
    var e = processexp(v[0]);
    // return e + ' instanceof Function ? ' + e + '() : .w(' + e + ')\n';
    return '.w(' + e + ')';
  }

  function processcall(v) {
    console.log('call');
    var callable = processcallable(v[0]);
    var params = v[1] || null;
    var output = '.w(' + callable + '($c';

    if (params) {
      output += ',';
      output += params.map(function(p) {
        return processexp(p);
      }).join(',');
    }

    output += '))';
    return output;
  }

  function processraw(v) {
    return '.w(' + v[0] + ')';
  }

  function processescape(v) {
    // TODO:
    return '.w(~' + v[0] + ')';
  }

var ast = parser(sample);
// console.log(JSON.stringify(ast, null, 2));
// console.log(ast);

if (ast[0] !== 'block') {
  console.log('then thats a fail');
} else {
  var code = 'var template =(function($c) {return $c' + processblock(ast[1]) + '});';
  console.log(code);
}

// if we can transform it back into the original, then we are doing pretty good
