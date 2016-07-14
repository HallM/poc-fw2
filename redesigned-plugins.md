This affects the whole framework really. The "framework" itself becomes just the "plugin"/service system

At the core:
- Services

Two "types" of services:
- Singleton / Global services
- Scoped services

Plugins/providers/whatever we call them can have Init Phases.
Each Phase may have different Wait/Block (current plugin system).
Things should be loaded in an order or batched.
To allow dynamic loading (needed for splitting client side bundles):
- Plugins can be loaded at any time
- If a plugin has a Wait and that thing does not exist, Error
- If a plugin has a Block and that thing is already loaded, Error
- A batch-load system should be used to allow loading many things at once and handle Wait/Blocks

```js
PluginManager.batchLoad(() => {
  require('my-plugin-one');
  require('my-plugin-two');
  require('my-plugin-three');
  // ...
});
```

Plugins themselves do stuff and/or provide "services" for others to use/inject.
A plugin may act as a "service provider" by registering serviecs either globally or as a scope.
Though, if a plugin creates a scope, it is responsible for exposing that scope to others who may want it.

```ts
import { Plugin, InitPhase, After, Before } from 'fwsys'

@Plugin
class MyPluginOne {
  @InitPhase
  @After('MyPluginTwo:somePhase')
  @Before('MyPluginThree:blockedPhase')
  initPhase(myPluginTwo) {
    this.exposeService(globalService);

    whenSomethingHappens((value) => {
      this.trigger('some-event', 'hello world');

      let scope = this.generateScope();
      scope.exposeService(svcKey, value);
    });

    // we could, optionally, return something for MyPluginThree:blockedPhase to use
  }

  @Before('some-event')
  beforeSomeEvent(str) {
    // but how to know the order in which the pre-processors occur?
    // I just know, right now, that return changes the value(s) for the event
    // maybe. maybe not. dunno.
    return we.gottaPreProcess(str);
  }

  @After('some-event')
  afterSomeEvent(str) {
    we.actOn(str);
  }

  @After('generate-scope')
  afterScopeGenerated(scope) {
    scope.exposeService(scopedSvcKey, scopedService);
  }
}
export = MyPluginOne;
```
