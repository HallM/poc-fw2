{
  function makeInteger(arr) {
    return parseInt(arr.join(''), 10);
  }
  function withPosition(arr) {
    return arr;/*.concat([['line', line()], ['col', column()]])*/;
  }
}

start
    = block

block
    = s:(statement / buffer)*
    { return withPosition(['block', s]); }

eol
    = "\n"
    / "\r\n"
    / "\r"
    / "\u2028"
    / "\u2029"

ws
    = [\t\v\f \u00A0\uFEFF] / eol

opentag
    = "{"

closetag
    = "}"

string
    = '"' s:(!'"' !eol c:. {return c})* '"'
    { return ['literal', s.join('')]; }

identifier
    = s:[a-zA-Z] c:[a-zA-Z0-9_]*
    { return withPosition(['identifier', s + c.join('')]); }

number
    = n:(float / integer) { return ['literal', n]; }

float
    = l:integer "." r:unsigned_integer { return parseFloat(l + "." + r); }

unsigned_integer
    = digits:[0-9]+ { return makeInteger(digits); }

signed_integer
    = '-' n:unsigned_integer { return n * -1; }

integer
    = signed_integer / unsigned_integer

literal
    = string
    / number

variable
    = c:(n:identifier ":" { return n; })? n:identifier
    { return withPosition(['variable', c || '', n]); }

expression
    = literal
	/ variable

paramAssignment
    = p:identifier "=" v:expression ws*
    { return withPosition(['paramset', p, v]); }

componentName
    = identifier
    / string

buffer
    = e:eol w:ws*
    { return ["format", e, w.join('')]; }
    / b:(!Comment !opentag !closetag !eol c:. {return c})+
    { return ["buffer", b.join('')]; }

escapekeys
    = "s"
    / "n"
    / "r"
    / "lb"
    / "rb"
escapes
    = opentag "~" k:escapekeys closetag
    { return ['escape', k]; }

statement
    = Comment
    / Raw
    / Body
    / Call
    / VariableUse
    / Exist
    / NonExist
    / Each
    / Helper
    / Component
    / escapes

filter
    = "|" f:identifier
    { return withPosition(['filter', f]); }

VariableUse
    = opentag v:variable f:filter* closetag
    { return withPosition(['varaccess', v, f]); }

commentopen
    = opentag "!"
commentclose
    = "!" closetag
Comment
    = commentopen v:(!commentclose c:. {return c})* commentclose
    { return withPosition(['comment', v]); }

rawopen
    = opentag "`"
rawclose
    = "`" closetag
Raw
    = rawopen r:(!rawclose c:. {return c})* rawclose
    { return withPosition(['raw', r]); }

bodysigil = "def" / ":"
Body
    = opentag bodysigil ws* i:identifier? ws* b:block ws* closetag
    { return withPosition(['body', i, b]); }

callsigil = "call" / "+"
Call
    = opentag callsigil ws* i:identifier? ws* b:Body? ws* p:paramAssignment* ws* closetag
    { return withPosition(['call', i, b, p]); }

existsigil = "if" / "?"
Exist
    = opentag existsigil ws* v:variable ws* t:statement ws* f:statement? ws* closetag
    { return withPosition(['exist', v, t, f]); }

nonexistsigil = "ifnot" / "^"
NonExist
    = opentag nonexistsigil ws* v:variable ws* t:statement ws* f:statement? ws* closetag
    { return withPosition(['nonexist', v, t, f]); }

eachsigil = "each" / "#"
Each
    = opentag eachsigil ws* v:variable ws* t:statement ws* f:statement? ws* closetag
    { return withPosition(['each', v, t, f]); }

helpersigil = "helper" / "@"
Helper
    = opentag helpersigil ws* i:identifier ws* p:paramAssignment* ws* b:Body* ws* closetag
    { return withPosition(['helper', i, p, b]); }

componentsigil = "insert" / ">"
Component
    = opentag componentsigil ws* i:componentName ws* p:paramAssignment* b:Body* ws* closetag
    { return withPosition(['component', i, p, b]); }
