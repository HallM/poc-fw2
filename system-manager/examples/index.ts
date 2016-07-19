import { PluginManager } from '../';

console.log('should be undefined:');
console.log(PluginManager.getService('global'));
console.log('');

console.log('start loading the batch');
PluginManager.batchLoad(() => {
  require('./plugin-one');
  require('./plugin-two');
  require('./plugin-three');
}).then(() => {
  console.log('finished loading');
  console.log('');

  console.log('should be defined now:');
  console.log(PluginManager.getService('global'));

  console.log('testing generating scopes:');
  const scope = PluginManager.generateScope();
  console.log(scope);
  console.log(scope.getService('scoped'));
});
