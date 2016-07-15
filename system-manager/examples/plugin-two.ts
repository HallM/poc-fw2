import { Plugin, InitPhase, After, Before, Inject } from '../'

@Plugin('MyPluginTwo')
class MyPluginTwo {
  @InitPhase
  somePhase() {
    console.log('this is MyPluginTwo:somePhase');
  }
}
export = MyPluginTwo;
