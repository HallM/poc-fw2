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

todo:
- selecting the session store

future:
- method to specify certain behaviors during errors

- loading component scripts

- custom template engine? reasoning:
    - ability to determine which components should be loaded ahead of time
    - ability to get a dust-like yet VDOM for client side system
    - React-like yet better separation of concerns (designer vs programmer)

- hot loading

- a way to import/bind/require specific JS or CSS and auto gen

- a way to cleanly specify client side behaviors

- automatic attachment of events between client and server side (forms, navigation, etc)

- client side rendering and server just sending back a JSON to use for rendering
    - this may also need to understand subcomponents in order to load anything they need
