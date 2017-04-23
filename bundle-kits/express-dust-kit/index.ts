/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager } from '../../kit-manager/';

import ExpressKit from '../express-kit';
import DustExpressAutoRoutes from '../../kits/dust-express-auto-routes';
import DustView from '../../kits/dust-view';

// this is really just a bundle of things
export default KitManager.loadMultiple((batchLoader) => {
    batchLoader.addBatch(ExpressKit);
    batchLoader.addKit(DustExpressAutoRoutes);
    batchLoader.addKit(DustView);
});
