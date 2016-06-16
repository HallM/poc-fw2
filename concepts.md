This may not be a properly formatted markdown file, just gathering ideas.

POC:
- keep simple, keep minimal
- fully server side
- use express
- use dust
- focus on the auto-gen URLs

loading:
- recursively go through ./views/pages/**
- check if the page_name has a matching ./server/pages/page_name
- if not: create a static page route
- if yes: set the function handler to what is returned from ./server/pages/page_name

todo and future:

- selecting the session store (probably some other things)
    - could do like try{} and attempt to load any available store

- error views
- method to specify certain behaviors during errors

- specifying actions?
    - are they specified at the component/page level?
    - or are they in their own world? this is more an api-like approach
    - if we go the component-action route:
        - what's the specification for a component/page?
        - is it a class (like tapestry) which has hooks plus action handlers?
        - i feel like using class lends more to using JSX-like templates (why again?)
        - could do components export pure-fns that accept state, props, ctx
            - the names of these fns would be important
        - how to determine the URL for the action? especially knowing component reuse.
            - could do `{component}.{actionname}/{?context}`
            - interesting idea: `server/components/{component}.{actionname}.lng`
        - now, how to specify the method used for the action?
            - one could assume post is going to be the most common for an action
            - get is still possible (think async get-project-names, implement that)
            - delete, put, patch should be possible as well
            - option 1: fn name is important
                - `getProjectNames` -> GET `/{component}.projectNames`
                - `deleteProject` -> DELETE `/{component}.project`
                - `anythingelse` -> assume post otherwise
                - could de-dup by removing exact HTTP verb from URL
                - 2nd level de-dup removes redundancies like `DELETE /project.project`
                    - may want to recognize plurals: `DELETE /projects.project` -> `DELETE /projects`
                - in this option, would need a way to configure verbs -> HTTP verb map
        - of course, allow some way to set custom URL and/or http method
        - maybe use a sub object? or properties attached to the function?
    - the last question, no matter the path, what is passed to the action?
        - i want to keep it params + return values + throws
```js
// mycomponent.ts, not fully valid TypeScript with Decorators
export default {
    @Body('bodyParam', validations...)
    someAction: function *(param: String, context: String) {},

    @Query('queryParam', validations...)
    getMyAction: function *(param: String, context: String) {},

    // even more ideal, may work with typescript:
    putMyAction: function *(@Query('qaram') q: String, @Body('bparam') b: String, context: String) {}

    // just declaring everything
    // and yes the params are reverse order here... is possible to make it non-reverse
    @Method('delete')
    @Url('/decoratedUrl')
    @Body('bodyParam')
    @Query('queryParam')
    decoratedAction: function *(queryParam: String, bodyParam: String) {},

    // aaand what it looks like with the param decorators
    @Method('put')
    @Url('/specialize')
    specialDecoration: function *(@Query('queryParam') queryParam: String, @Body('bodyParam') bodyParam: String) {},

    // lifecycle/render events
    beforeRender: function *() {},
    // ... many more ...
};
```
Also note: the same decorator system is possible with Java, C#, and many others.

I also feel this may be a clean path (also, decorators only work with classes):
```ts
// this is what gets called when the component is created/loaded
// use it for data fetching or whatever
export class Component {
    @Model(MyDataModel)
    dataModel: MyDataModel,

    @Persist
    counter: Number,

    // async constructor is a big noooo, so we use init
    async init(@Query('queryParam') queryParam: String, @Body('bodyParam') bodyParam: String) {}

    async someAction(context: String) {}

    // can override the method and url desired
    @Method('put')
    @Url('/specialize')
    async special() {}

    // and also lifecycle stuff
    async beforeRender() {}
}
```

- api-like things
    - if actions get their own section, it's basically an API style anyway
    - if actions are built into component/pages?
    - but do we need API? is it really much effort to add it in?
    - on one hand, could have components without render-ables since GET-actions

- plugins (specifying what to load, maybe plugin dependencies, when to load it)
    - when/event based:
        - pre-server init
        - pre-session init
        - post-session init
        - post-server init
        - pre-request (how to determine order?)
        - post-request
    - or only have dep declaration and we just always make sure things are loaded right
    - the plugin itself should define when it should be started
        - the end user shouldn't concern themselves with that
    - cannot promise the exact order, but can promise dep:event
    - may need like a file to specify which plugins via NPM scripts
    - could also load everything from a /plugins directory
    - specify in code `server.loadPlugin(require('my-plugin'))` or config file?
    - complex: could a plugin have multiple stages to loading? possible I guess
    - a plugin may attach it's own routes
    - a plugin may attach middlewares are various stages
    - a plugin could have configuration for itself
    - maybe deps have events of their own.
        - "plugin:event" load after the event inside of plugin is done
        - ~~"plugin" is short for "plugin:default"~~ -> no defaults
        - ~~"plugin:*" to always mean entirely loaded (default existing or not)~~
        - getting rid of "default" lets us say "plugin" means fully loaded
        - "plugin:notrealevent" should throw an error
    - in order to prevent the framework from continuing initialization,
      we should continue to run plugin events until we can no longer.
      once we run out of events, then move to the next phase of fw init.
    - possible loader algorithm:
        - load all the plugins to know what exists, prior to anything
        - start the framework
        - do not allow loading more plugins once framework is started
        - at each stage of the framework initialization:
            - determine what can run now and mark them (do not run them just yet)
            - if no items, continue to next stage of initialization
            - run those items once they're all determined (helps maintain order)
            - repeat

```ts
// plugin.js
export class Plugin {
    // nodep can load immediately
    nodep() {}

    // loaded at some point after another-plugin:event
    @PluginWait('another-plugin', 'event')
    event() {}

    // waits for the pre-port-bind event from the primary system
    // null (and/or empty string?) means the framework itself
    @PluginWait(null, 'pre-port-bind')
    ohWaitThisToo() {}

    // waits for self-start and some other plugin's default
    // '.' means self
    @PluginWait('.', 'ohWaitThisToo')
    @PluginWait('some-other-plugin')
    waitOnSelf() {}
}
```

- settings (server side, maybe client side stuff too)
    - directories
    - action verb to HTTP verb/method maps (*:1 mapping)
    - port to listen on
    - plugin settings
    - session key
    - signed cookie key
    - log level
    - other log settings
    - custom URL auto-gen algorithm?

- loading component scripts
    - we have to load their existence to generate all the action URLs

- custom template engine? reasoning:
    - ability to determine which components should be loaded ahead of time
    - ability to get a dust-like yet VDOM for client side system
    - React-like yet better separation of concerns (designer vs programmer)
    - ability to make it work with any desired programming language

- if not a custom template engine, could use dust helpers (or a dust-dialect/fork)
    - locks into JS (though, Java+Nashorn et al is possible... eh)
    - dust helpers, because dust.onload caches things often
    - dust-as-is: component helper. fork: override partial loader
    - accessing something from a strings/labels file
    - require JS or CSS
        - can we dynamically build per-page JS or CSS?
        - how would that even happen? like, how to scan through components to find requires?
        - when: obviously happens during load time? or maybe a build-time?
        - then, how to handle live-edits (dev mode)
        - can required items be specified as "Above fold" or async?
    - helper for dropping the page's CSS and JS in

- bunch of components for things like actionlink, pagelink, form

- a way to import/bind/require specific JS or CSS and auto gen page bundles

- client side behaviors and state
    - think of the sidebar that slides out

- automatic attachment of events between client and server side (forms, navigation, etc)
    - well, not so much 100% "automatic" as it is "specify the event name and we wire it"

- client side rendering and server just sending back a JSON to use for rendering
    - this is post initial render, which is server side
    - this may also need to understand subcomponents in order to load anything they need
    - also, figuring out "we already loaded the sidebar, don't reload"

- persist things on the session

- cache system and/or memo-ization system

- typescript friendly

- IoC system ?

- hot loading: editing template files and seeing changes reflect.
    - even better if this can be done with CSS and client side JS to an extent
    - server side? can always just reboot the thing
