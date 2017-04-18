import ExpressDustKit from '../express-dust-kit/';
import GlobalServiceManager from '../service-manager/';

ExpressDustKit.then(() => {
    const logger = GlobalServiceManager.getService('logger');
    logger.info('Server is ready');
}).catch((err) => {
    console.error(err);
});
