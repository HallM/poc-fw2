import { PluginManager, Plugin, InitPhase, After, Before, On, Inject } from '../'

@Plugin
class MyPluginOne {
  @InitPhase
  @After('MyPluginTwo:somePhase')
  @Before('MyPluginThree:blockedPhase')
  @After('notreally:aphase', false)
  @Before('alsonot:aphase', false)
  initPhase(two) {
    console.log('this is MyPluginOne:initPhase', two);
    PluginManager.exposeService('global', {globalme: 'this is global'});
    return 1;
  }

  @InitPhase
  concurrentThings() {
    console.log('start MyPluginOne:concurrentThings waiting 1s');
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve('from MyPluginOne'), 1000);
    });
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
