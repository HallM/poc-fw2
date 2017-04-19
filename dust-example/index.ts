import ExpressDustKit from '../bundle-kits/express-dust-kit/';
import { PluginManager } from '../system-manager/';

ExpressDustKit.loadAll().then(() => {
    const logger = PluginManager.getService('logger');
    logger.info('Server is ready');
}).catch((err) => {
    console.error(err);
});
