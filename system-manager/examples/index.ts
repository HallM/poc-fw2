import { PluginManager } from '../';

PluginManager.batchLoad(() => {
  require('./plugin-one');
  require('./plugin-two');
  require('./plugin-three');
});
