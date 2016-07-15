import { Plugin, InitPhase, After, Before, Inject } from '../'

@Plugin('MyPluginThree')
class MyPluginThree {
  @InitPhase
  blockedPhase() {
    console.log('this is MyPluginThree:blockedPhase');
  }
}
export = MyPluginThree;
