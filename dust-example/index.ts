import ExpressDustKit from '../bundle-kits/express-dust-kit/';
import { KitManager } from '../system-manager/';

ExpressDustKit.loadAll().then(() => {
    const logger = KitManager.getService('logger');
    logger.info('Server is ready');
}).catch((err) => {
    console.error(err);
});
