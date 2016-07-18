import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../'

@Plugin
class MyPluginTwo {
  @InitPhase
  somePhase() {
    console.log('this is MyPluginTwo:somePhase');
    PluginManager.trigger('some-event');
  }
}
export = MyPluginTwo;
