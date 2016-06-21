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

- Changing the context system
    - needs to be component isolated
    - blocks keep their owner-component context
    - all data is within the root of the component
    - note: serviceManager should not be passed through dust... need a better way...
- Blocks will no longer be global
    - they carry the component's context and not the partial's context
    - blocks are defined within the partial insert call
    - that allows blocks to be specific to a partial (names could be reused elsewhere)
    - no more :else being special and non-global, vs partial blocks
    - there is a special un-named block for anything not in a specific block
- The syntax `{>"my-partial" /}` may not require the quotes
- Will need to generate a component graph for lots of things
- Need a way to initialize component server-code if available
    - component server code will need Injects taken care of and other context
- Could add a Match system similar to rust to take care of the if need

Maybe for the service manager, have some sort of special "context" that represents a request.
Aka, a rendering cycle.
