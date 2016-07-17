import { Plugin, InitPhase, After, Before, Inject } from '../'

@Plugin('MyPluginTwo')
class MyPluginTwo {
  @InitPhase
  somePhase() {
    console.log('this is MyPluginTwo:somePhase');
    (this as any).trigger('some-event');
  }
}
export = MyPluginTwo;
