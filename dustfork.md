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
* Is there a view-model on client side?
    * Is it different than the one on server?
    * Could different view models share code?

Maybe for the service manager, have some sort of special "context" that represents a request.
Aka, a rendering cycle.
