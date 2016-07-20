import { PluginManager, Plugin, InitPhase, After, Before, On, Inject } from '../'

@Plugin
class MyPluginTwo {
  @InitPhase
  somePhase() {
    console.log('this is MyPluginTwo:somePhase');
    PluginManager.trigger('some-event');
    return 2;
  }

  @InitPhase
  concurrentThings() {
    console.log('start MyPluginTwo:concurrentThings waiting 1s');
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve('from MyPluginTwo'), 1000);
    });
  }
}
export = MyPluginTwo;
