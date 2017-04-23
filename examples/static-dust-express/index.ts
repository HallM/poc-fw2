/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager } from '../../kit-manager/';

import ExpressDustKit from '../../bundle-kits/express-dust-kit';
import DustExpressAutoRoutes from '../../kits/dust-express-auto-routes';

// this is really just a bundle of things
KitManager.loadMultiple((batchLoader) => {
    batchLoader.addBatch(ExpressDustKit);
    batchLoader.addKit(DustExpressAutoRoutes);
}).loadAll().then(() => {
    const logger = KitManager.getService('logger');
    logger.info('Server is ready');
}).catch((err) => {
    console.error(err);
});
