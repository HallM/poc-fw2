This is more than just a fork, it's an entire re-imagining.

Dust-like syntax, a lot of shared concepts

Goals kept from Dust:
* Asynchronous
* Capable of handling Promises (and other thenables)
* Designer friendly
* Deter people from using too much logic
* Work server and client side

New Goals:
* Component based
* Component context is isolated from other components
* Scoped blocks inside partial syntax
* Predictable context to determine lookups at compile time
* Localization using a strings file (or multiple strings files)

Goals that may not be scoped to the view engine itself, but related:
* Different templates/renderables for different languages
* Error templates/renderables specific to a component for various errors
* Generate CSS and JS bundles for an entire page-component (needs component graph)

High level changes
- Changing the context system
    - needs to be component isolated
    - blocks keep their owner-component context
    - all data is within the root of the component
    - note: serviceManager should not be passed through dust... need a better way...
- Blocks for partials will no longer be global
    - they carry the component's context and not the partial's context
    - blocks are defined within the partial insert call
    - that allows blocks to be specific to a partial (names could be reused elsewhere)
    - no more :else being special and non-global, vs partial blocks
    - there is a special un-named block for anything not in a specific block
    - blocks should be able to accept parameters from calling partials
    - could the block-define specify parameter-requirements?
- The syntax `{>"my-partial" /}` may not require the quotes
- Will need to generate a component graph for lots of things
- Should initialize view-models instances and handle life-cycle
    - view-model will need Injects taken care of and other context

Questions:
* Match (helper? component?) similar to Rust's match
* With the component system, is a helper not just a component?
    * Basically, could a helper be a template-less component?
    * If so, components may need a render() function for when a template is missing
    * Would the compiler merge the template-rendering fn into the code?
* Template level blocks for different renderables?
    * Example: a `{<error-4xx}` block would mean "render this in a 4xx error"
    * At first I thought of catch blocks, but view-model should do that. not view.
* Should components define their parameter requirements?
    * More than likely, but how to specify? Feels like a ViewModel-side of things
    * Also, how to specify what to show in the event of a validation failure?
* Would someone need to inject the context? Yes and No.
    * Most of the context is from the view-model
    * What isn't is parameters passed via partial or block.
    * ~~should it be the entire context?~~
    * ~~just some of the context `@ContextGet('.my.path')`~~
* I felt the context-immutability was silly, but then I wonder when a view-model breaks it...
    * Options are keep the context-immutability
    * or clone the context to pass to the view-model and not care what they do
    * The immutable nature may help async
    * Passing context around may be a result of that async nature too
* Is there a view-model on client side?
    * Is it different than the one on server?
    * Could different view models share code?

```
Maybe for the service manager, have some sort of special "context" that represents a request.
Aka, a rendering cycle.

named body
{:name paramname ... }
BODY
{/:}

named block: (must be inside a partial)
though, isn't a block just a body, but with < instead of : ?
{<name}
BODY
{/<}

block (body?) insertion point:
{+name param=value ...}
default body
{/+}

get from context (only one not self-closing)
{path}
also with filters
{path|filter1|filter2...}

if-section
{?path}
BODY
{:else}
optional else body
{/?}

if-not-section
{^path}
BODY
{:else}
optional else body
{/^}

each-section
{#path}
BODY
also should expose index, isfirst, islast
may want to set own names, this way they can have an i and a j
could it also allow a foreach myarray as value style?
    {#path i=index }
        not included? nothing is created
        my complaint on this style is index is not a real var, just internal thing
        if we change to a string, we have to know if that string is something of theirs or the internal "index"
    {/#}
    {#path index="i" }
        not included? nothing is created
        a bit better as index is the parameter to the foreach (which makes sense)
        the reverse bind (i becomes the value of index) is less obvious
        the string has to be validated to be a valid name
    {/#}
    {#path i _ islast }
        _ is a don't care
        missing parameters just aren't defined
        problem with this style is no other construct uses order specific params like this
        is similar to a function call, so it's something people could get used to
    {/#}

though, Dust exposes $idx, $len as the variables

chould this also be a for-in iterating over props?
{:else}
optional if-none body
{/#}

helper
{@name param=value ...}
unnamed body
{:name}
other named bodies can be used, must have ending tag unlike normal dust
{/:}
{/@}

component insert
{>componentname param=value ...}
unnamed body
{:name}
named body used with specific insertion points
{/:}
{/>}

special
{~s} {~n} {~r} {~lb} {~rb}

root-body:
can use named bodies (or blocks?) for separating renderables
{:error-4xx}
{/:}

interesting thought, callable subcomponents/macros/bodies:
{:subcomponent param=isString}
    rendering a subcomponent
{/:}
{#mydata}
    {+subcomponent param=. /}
{/#}

why not let bodies be defined everywhere and scoped,
and callable, so even an :else is callable
interesting characteristic of this design: lambda's and set syntax
{#rows}
    {:labmda i}
        {#cols}
            {:labmda j}
                value at row {i}, col {j} is: {.}
            {/:}{+labmda j=$idx /}
        {/#}
    {/:}{+labmda i=$idx /}
{/#}

though, how could a body-lambda be immediately executed?
while a set syntax may be cleaner, the lambda fits with the ctx situation (also, no mutation)
the only way to make set work is to be just a sugar for immediately executing block
{#rows}
    {$ i=$idx row=.}
        {#cols}
            {$ j=$idx item=.}
                value at row {i}, col {j} is: {item}
            {/$}
        {/#}
    {/$}
{/#}

context:
go with something like a lexical scoping system
context will keep a scope stack
scopes are just name:value maps where name is the variable name, value is of course, the value
may also keep the globals to use for the service manager, etc
the bottom of the stack is always from the component's view-model, or {} if no view-model exists
things that take parameters push the param:value scope to the stack
a body should carry along the current context of it's parent for when it is called, even in another component

As an aside... what would a lisp-like version of this look like?
`:` means call
`$` means define
`#` means iterate
<ul>
{# rows
  {: {$ i row
    <li>
      {# row
        {: {$ j item
          value at row {+ i 1} col {+ j 1} is {item}
        } $idx .}
      }
    </li>
  } $idx .}
}
</ul>
```
