import { PluginManager, Plugin, InitPhase, After, Before, On, Inject } from '../'

@Plugin
class MyPluginThree {
  @InitPhase
  blockedPhase() {
    console.log('this is MyPluginThree:blockedPhase');
    return 3;
  }

  @InitPhase
  @Before('MyPluginTwo:somePhase')
  concurrentThings() {
    console.log('start MyPluginTwo:concurrentThings waiting only 50ms');
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve('from MyPluginTwo'), 50);
    });
  }

  @On('generate-scope')
  onScopeGenerated(scope) {
    console.log('MyPluginThree responding to scope generation');
    scope.exposeService('three', 3);
  }
}
export = MyPluginThree;
