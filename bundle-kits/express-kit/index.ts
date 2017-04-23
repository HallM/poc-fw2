/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager } from '../../kit-manager/';

import BodyParser from '../../kits/body-parser';
import NconfKit from '../../kits/nconf';
import CookieParser from '../../kits/cookie-parser';
import ErrorRouter from '../../kits/error-router';
import Express from '../../kits/express';
import ExpressCompression from '../../kits/express-compression';
import ExpressSecurity from '../../kits/express-security';
import ExpressSession from '../../kits/express-session';
import ExpressStatic from '../../kits/express-static';
import ExpressWinston from '../../kits/express-winston';
import WinstonKit from '../../kits/winston';

// this is really just a bundle of things
export default KitManager.loadMultiple((batchLoader) => {
    batchLoader.addKit(BodyParser);
    batchLoader.addKit(NconfKit);
    batchLoader.addKit(CookieParser);
    batchLoader.addKit(ErrorRouter);
    batchLoader.addKit(Express);
    batchLoader.addKit(ExpressCompression);
    batchLoader.addKit(ExpressSecurity);
    batchLoader.addKit(ExpressSession);
    batchLoader.addKit(ExpressStatic);
    batchLoader.addKit(ExpressWinston);
    batchLoader.addKit(WinstonKit);
});
