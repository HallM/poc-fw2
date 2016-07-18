import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../'

@Plugin
class MyPluginThree {
  @InitPhase
  blockedPhase() {
    console.log('this is MyPluginThree:blockedPhase');
  }
}
export = MyPluginThree;
