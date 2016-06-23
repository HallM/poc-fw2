start =
    statement*
    { return null; }

string =
    '"' (!'"' c:. {return null})* '"'
    { return null; }

identifier =
    [a-zA-Z][a-zA-Z0-9_]*
    { return null; }

number =
    [0-9]+
    { return null; }

expression =
    string
	/ identifier ":" identifier
    / identifier
    / number
    { return null; }

paramDeclaration =
    identifier
    { return null; }

paramAssignment =
    identifier "=" expression
    { return null; }

componentName =
    identifier
    / string
    { return null; }

buffer
  = e:eol w:ws*
  { return null; }
  / b:(!Comment !"{" !eol c:. {return c})+
  { return null; }

escapes =
    "{" "~" "s" "}"
    / "{" "~" "n" "}"
    / "{" "~" "r" "}"
    / "{" "~" "lb" "}"
    / "{" "~" "rb" "}"
    { return null; }

tag =
    Comment
    / Call
    / VariableUse
    / Exist
    / NonExist
    / Each
    / Helper
    / Component
    / escapes

statement =
    Body
    / tag
    / buffer
    { return null; }

filter =
    "|" identifier
    { return null; }

Comment =
    "{!" (!"!}" c:. {return null})* "!}"
    { return null; }

Body =
    "{:" identifier paramDeclaration* "}"
    statement*
    "{/:}"
    { return null; }

Call =
    "{+" identifier paramAssignment* "}"
    statement*
    "{/+}"
    { return null; }

VariableUse =
    "{" identifier filter* "}"
    { return null; }

Exist =
    "{?" identifier "}"
    statement*
    "{/?}"
    { return null; }

NonExist =
    "{^" identifier "}"
    statement*
    "{/^}"
    { return null; }

Each =
    "{#" identifier "}"
    statement*
    "{/#}"
    { return null; }

Helper =
    "{@" identifier paramAssignment* "}"
    statement*
    "{/@}"
    { return null; }

Component =
    "{>" componentName paramAssignment* "}"
    statement*
    "{/>}"
    { return null; }

eol
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

ws
  = [\t\v\f \u00A0\uFEFF] / eol
