# poc-fw2
POC for a framework idea

This has a bit of inspiration from Tapestry.
The eventual concept is listed in concepts.md, though not 100% detailed yet.

The primary goals are:
- Separation of concerns for designers and programmers
- Make it easier for static-y sites to add new pages
- Reduce the amount of effort for a developer to add dynamic pages
- Component-based architecture

To run the example, go into the example directory and run
```sh
$ npm start
```

You can also do
```sh
$ node -e "require('../')"
```

The example does not have a starting place as the framework takes care of that.

Pros:
- quick and easy on developer

Cons:
- makes things "magic" and less known to the developer
