import { Plugin, InitPhase, After, Before, On, Inject } from '../'

@Plugin('MyPluginOne')
class MyPluginOne {
  @InitPhase
  @After('MyPluginTwo:somePhase')
  @Before('MyPluginThree:blockedPhase')
  initPhase() {
    (this as any).exposeService('global', {globalme: 'this is global'});
    console.log('this is MyPluginOne:initPhase');
  }

  @On('some-event')
  onSomeEvent() {
    console.log('MyPluginOne doing something with some-event');
  }

  @On('generate-scope')
  onScopeGenerated(scope) {
    console.log('MyPluginOne responding to scope generation');
    scope.exposeService('scoped', {scopeme: 'this is scoped'});
  }
}
export = MyPluginOne;
