/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager } from '../../system-manager/';

export {
    Query, Param, Header, Body, UrlHandler, Middleware, Method
} from '../express-kit';

import ExpressKit from '../express-kit';
import DustExpressAutoRoutes from '../../kits/dust-express-auto-routes';
import DustView from '../../kits/dust-view';
import ExpressControllers from '../../kits/express-controllers';

// this is really just a bundle of things
export default KitManager.loadMultiple((batchLoader) => {
    batchLoader.addBatch(ExpressKit);
    batchLoader.addPlugin(DustExpressAutoRoutes);
    batchLoader.addPlugin(DustView);
    batchLoader.addPlugin(ExpressControllers);
});
