/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager } from '../../kit-manager/';

export { Query, Param, Header, Body } from '../../kits/express-controllers/decorators/req-param';
export { UrlHandler } from '../../kits/express-controllers/decorators/url-handler';
export { Middleware } from '../../kits/express-controllers/decorators/middleware';
export { Method } from '../../kits/express-controllers/decorators/method';

import ExpressDustKit from '../../bundle-kits/express-dust-kit';
import ExpressControllers from '../../kits/express-controllers';

// this is really just a bundle of things
KitManager.loadMultiple((batchLoader) => {
    batchLoader.addBatch(ExpressDustKit);
    batchLoader.addKit(ExpressControllers);
}).loadAll().then(() => {
    const logger = KitManager.getService('logger');
    logger.info('Server is ready');
}).catch((err) => {
    console.error(err);
});
