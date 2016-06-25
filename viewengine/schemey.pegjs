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
    = s:(Tag / buffer / Comment)*
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
    { return '"' + s.join('') + '"'; }

number
    = n:(float / integer) { return n; }

float
    = l:integer "." r:unsigned_integer { return parseFloat(l + "." + r); }

unsigned_integer
    = digits:[0-9]+ { return makeInteger(digits); }

signed_integer
    = '-' n:unsigned_integer { return n * -1; }

integer
    = signed_integer / unsigned_integer

literal
    = l:(string / number)
    { return ['literal', [l]]; }

key
    = s:[a-zA-Z$_] c:[a-zA-Z0-9$_]*
    { return s + c.join(''); }

ctx
    = s:[a-zA-Z] c:[a-zA-Z0-9_]*
    { return s + c.join(''); }

identifier
    = c:(c:ctx ":" { return c; })? i:key
    { return withPosition(['identifier', [c || '', i]]); }

// param
//     = k:key "=" v:expression
//     { return withPosition([k, v]); }
// paramset
//     = s:(p:param filler { return p; })*
//     { return ['paramset', s]; }

paramlist
    = "(" filler p:(k:key filler { return k; })* filler ")"
    { return p; }
paramset
    = p:(e:expression filler { return e; })*
    { return p; }

buffer
    = e:eol w:ws*
    { return ["format", ['\\n' + w.join('')]]; }
    / b:(!Comment !opentag !closetag !eol c:. {return c})+
    { return ["buffer", [b.join('')]]; }

escapekeys
    = "s"
    / "n"
    / "r"
    / "lb"
    / "rb"
escapes
    = opentag "~" k:escapekeys closetag
    { return ['escape', [k]]; }

commentopen
    = opentag "!"
commentclose
    = "!" closetag
Comment
    = commentopen (!commentclose .)* commentclose
//    = commentopen (!commentclose c:. {return c})* commentclose
//    { return withPosition(['comment', [v.join('')]]); }

filler
    = (ws / Comment)*

rawopen
    = opentag "`"
rawclose
    = "`" closetag
Raw
    = rawopen r:(!rawclose c:. {return c})* rawclose
    { return withPosition(['raw', [r.join('')]]); }

Body
    = opentag filler "body" filler p:(l:paramlist filler { return l; })? b:block filler closetag
    { return withPosition(['body', [p, b]]); }

//filter
//    = "|" filler f:identifier
//    { return withPosition(['filter', [f]]); }

Get
    = opentag filler e:expression filler closetag
    { return withPosition(['get', [e]]); }

Call
    = opentag filler c:callable filler p:paramset filler closetag
    { return withPosition(['call', [c, p]]); }

Array
    = "(" filler a:(e:expression filler { return e; })* filler ")"
    { return withPosition(['array', [a]]); }

Empty
    = opentag closetag
    { return ['empty', []]; }

Tag
    = Body
    / Get
    / Call
    / Raw
    / escapes
    / Empty
expression
    = Tag
    / identifier
    / literal
    / Array

internalfunction
    = k:("helper"
        / "insert"
        / "each"
        / "if")
    { return ['internal', [k]]; }

callable
    = Body
    / internalfunction
    / identifier
