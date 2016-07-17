import { PluginManager } from '../';

console.log(PluginManager.getService('global'));

PluginManager.batchLoad(() => {
  require('./plugin-one');
  require('./plugin-two');
  require('./plugin-three');
});

console.log(PluginManager.getService('global'));

const scope = PluginManager.generateScope();
console.log(scope);
console.log(scope.getService('scoped'));
