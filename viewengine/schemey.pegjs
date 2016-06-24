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
    = s:(expression / buffer)*
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

key
    = s:[a-zA-Z$_] c:[a-zA-Z0-9$_]*
    { return s + c.join(''); }

ctx
    = s:[a-zA-Z] c:[a-zA-Z0-9_]*
    { return s + c.join(''); }

identifier
    = c:(c:ctx ":" { return c; })? i:key
    { return withPosition(['identifier', [c || '', i]]); }

param
    = k:key "=" v:expression
    { return withPosition(['param', [k, v]]); }
paramset
    = s:(p:param ws* { return p; })*
    { return s; }

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

Body
    = opentag ws* "begin" ws* b:block ws* closetag
    { return withPosition(['body', b]); }

filter
    = "|" ws* f:identifier
    { return withPosition(['filter', f]); }

Get
    = opentag ws* e:expression ws* f:filter* ws* closetag
    { return withPosition(['get', [e, f]]); }

Call
    = opentag ws* c:callable ws* p:paramset ws* closetag
    { return withPosition(['call', [c, p]]); }

Flow
    = opentag ws* f:internalflow ws* e:expression ws* t:expression f:expression? ws* closetag
    { return withPosition(['flow', [f, e, [t, f]]]); }

expression
    = Body
    / Get
    / Call
    / Flow
    / Raw
    / escapes
    / identifier
    / literal

internalfunction
    = "helper"
    / "insert"
    / "define"

callable
    = Body
    / internalfunction
    / identifier

internalflow
    = "each"
    / "if"
    / "ifnot"
