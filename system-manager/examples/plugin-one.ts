import { Plugin, InitPhase, After, Before, Inject } from '../'

@Plugin('MyPluginOne')
class MyPluginOne {
  @InitPhase
  @After('MyPluginTwo:somePhase')
  @Before('MyPluginThree:blockedPhase')
  initPhase(someService) {
    console.log('this is MyPluginOne:initPhase');
  }

  // @After('generate-scope')
  // afterScopeGenerated(scope) {
  //   scope.exposeService('svc', {});
  // }
}
export = MyPluginOne;
