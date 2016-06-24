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

const sample = `
{define percol={begin
  <{tag}>value at row {i} col {j} is {item}</{tag}>
}}

<table>
{each rows {{begin
    <tr>
      {each row
        {percol j=idx mytag="td" item={begin
          <span>{item}</span>
        }}
      }
    </td>
  } i=idx}
}
</table>
`;

const SyntaxError = require('./schemey').SyntaxError;
const parser = require('./schemey').parse;

const astProcessors = {
};

/*
things done during processing:
combine multiple format + buffers into a single buffer
remove comments

start block is always called after declaration

expressions:
body (begin) -> basically is an anonymous function/body
get (any expression, so could be param-less function)
call
flow
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

var ast = parser(sample);
console.log(JSON.stringify(ast, null, 2));
