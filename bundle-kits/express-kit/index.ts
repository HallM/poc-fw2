/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager } from '../../system-manager/';

export { Query, Param, Header, Body } from '../../kits/express-controllers/decorators/req-param';
export { UrlHandler } from '../../kits/express-controllers/decorators/url-handler';
export { Middleware } from '../../kits/express-controllers/decorators/middleware';
export { Method } from '../../kits/express-controllers/decorators/method';

import BodyParser from '../../kits/body-parser';
import Config from '../../kits/config';
import CookieParser from '../../kits/cookie-parser';
import ErrorRouter from '../../kits/error-router';
import Express from '../../kits/express';
import ExpressCompression from '../../kits/express-compression';
import ExpressSecurity from '../../kits/express-security';
import ExpressSession from '../../kits/express-session';
import ExpressStatic from '../../kits/express-static';
import ExpressWinston from '../../kits/express-winston';
import Logger from '../../kits/logger';

// this is really just a bundle of things
export default KitManager.loadMultiple((batchLoader) => {
    batchLoader.addPlugin(BodyParser);
    batchLoader.addPlugin(Config);
    batchLoader.addPlugin(CookieParser);
    batchLoader.addPlugin(ErrorRouter);
    batchLoader.addPlugin(Express);
    batchLoader.addPlugin(ExpressCompression);
    batchLoader.addPlugin(ExpressSecurity);
    batchLoader.addPlugin(ExpressSession);
    batchLoader.addPlugin(ExpressStatic);
    batchLoader.addPlugin(ExpressWinston);
    batchLoader.addPlugin(Logger);
});
