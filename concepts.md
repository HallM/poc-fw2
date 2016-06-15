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
                    - may want to recognize `DELETE /projects.project` too
                - in this option, would need a way to configure verbs -> HTTP verb map

- api-like things
    - is this in the scope of this framework?
    - if actions get their own section, it's basically an API style anyway
    - if actions are built into component/pages? maybe we ignore API

- plugins (specifying what to load, maybe plugin dependencies, when to load it)
    - when/event based:
        - pre-server init
        - pre-session init
        - post-session init
        - post-server init
        - pre-request (how to determine order?)
        - post-request
    - or only have dep declaration and we just always make sure things are loaded right
    - cannot promise order (well, it's alphabetical+dep based really)
    - may need like a file to specify which plugins via NPM scripts
    - could also load everything from a /plugins directory

- settings (server side, maybe client side stuff too)

- loading component scripts

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

- typescript friendly

- IoC system ?

- hot loading: editing template files and seeing changes reflect.
    - even better if this can be done with CSS and client side JS to an extent
    - server side? can always just reboot the thing
