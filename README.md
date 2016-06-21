# poc-fw2
POC for a framework idea

This has a bit of inspiration from Tapestry.
The eventual concept is listed in concepts.md, though not 100% detailed yet.

The primary goals are:
- Separation of concerns for designers and programmers
- Make it easier for static-y sites to add new pages
- Reduce the amount of effort for a developer to add dynamic pages
- Component-based architecture

Under constant evolution, expect breaking changes almost daily.

## Requirements ##

- Node 4.x or higher, 6.x is recommended
- Typescript 1.8 (will move to 2.0 once it is closer to release)

## Getting Started ##
This project uses Typescript heavily. To get everything needed to use and work with:

`npm install -g typescript typings`

These two are required. `typings` is a system for fetching type info for non-ts projects.

After installing both typescript and typings globally,

```
npm install
typings install
tsc
```

`typings install` will fetch all the type info needed defined in typings.json

`tsc` is the typescript compiler, though will not compile the example directory

## Running the example ##

First compile with typescript: `tsc`

Then run with `node .` or `node index.js`
