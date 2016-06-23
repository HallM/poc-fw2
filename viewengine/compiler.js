'use strict';

const sample = `
{:percol
  <td>value at row {i} col {j} is {item}</td>
}

<table>
{#rows {+ {:
    <tr>
      {#row
        {+percol i=i j=idx}
      }
    </td>
  } i=idx}
}
</table>
`;

const SyntaxError = require('./lispy').SyntaxError;
const parser = require('./lispy').parse;

const astProcessors = {
  block() {},
  literal() {},
  identifier() {},
  variable() {},
  paramset() {},
  escape() {},
  filter() {},
  varaccess() {},
  comment() {},
  buffer() {},
  raw() {},
  body() {},
  call() {},
  exist() {},
  nonexist() {},
  each() {},
  helper() {},
  component() {},
  format() {}
};

/*
things done during processing:
combine multiple format + buffers into a single buffer
remove comments

start block is always called after declaration
blocks -> basically functions, lots of time anon fns
bodies -> make function, if not named, it's anon
          add body name to a lex scope
          want to make sure it could be anon here
buffer -> write out
call -> do paramAssignment
        if i=null && b=body, call body
        if i!=null && b=identifier is function, call identifier
        else: error
paramset -> create a scope on stack
            add all params to the scope
            output <- setting the vars in stack
varaccess -> find the var in the scope. if not? assume viewmodel
escape -> just writes out an escaped char
raw -> just writes out as is

exist -> adds an if check on a value from varaccess(v)
         if true, run block
         else, if there's an "else" body defined, run that
nonexist -> adds an if check on a value from varaccess(v)
            if false, run block
            else, if there's an "else" body defined, run that
each -> adds an if check on a value from varaccess(v)
        if len, foreach -> run block
                the for each creates idx and item in scope
        else, if there's an "else" body defined, run that
helper -> runs the helper function with params & bodies
component -> calls that component with params & bodies

things that should be handled by something else:
literal
identifier
filter -> becomes a fn wrapper for var access
variable -> left is the ctx, right is the identifier in that ctx
            ctx is (empty), viewmodel, string
*/

var ast = parser(sample);
console.log(ast);
