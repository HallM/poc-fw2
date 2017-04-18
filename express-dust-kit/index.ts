/// <reference path="../_all.d.ts" />

'use strict';

import { PluginManager } from '../system-manager/';
import GlobalServiceManager from '../service-manager/';

export { Query, Param, Header, Body } from '../kits/express-controllers/decorators/req-param';
export { UrlHandler } from '../kits/express-controllers/decorators/url-handler';
export { Middleware } from '../kits/express-controllers/decorators/middleware';
export { Method } from '../kits/express-controllers/decorators/method';

import BodyParser from '../kits/body-parser';
import Config from '../kits/config';
import CookieParser from '../kits/cookie-parser';
import DustExpressAutoRoutes from '../kits/dust-express-auto-routes';
import DustView from '../kits/dust-view';
import ErrorRouter from '../kits/error-router';
import Express from '../kits/express';
import ExpressCompression from '../kits/express-compression';
import ExpressControllers from '../kits/express-controllers';
import ExpressSecurity from '../kits/express-security';
import ExpressSession from '../kits/express-session';
import ExpressStatic from '../kits/express-static';
import ExpressWinston from '../kits/express-winston';
import Logger from '../kits/logger';

// this is really just a bundle of things
export default PluginManager.batchLoad((batchLoader) => {
    PluginManager.addPlugin(BodyParser);
    PluginManager.addPlugin(Config);
    PluginManager.addPlugin(CookieParser);
    PluginManager.addPlugin(DustExpressAutoRoutes);
    PluginManager.addPlugin(DustView);
    PluginManager.addPlugin(ErrorRouter);
    PluginManager.addPlugin(Express);
    PluginManager.addPlugin(ExpressCompression);
    PluginManager.addPlugin(ExpressControllers);
    PluginManager.addPlugin(ExpressSecurity);
    PluginManager.addPlugin(ExpressSession);
    PluginManager.addPlugin(ExpressStatic);
    PluginManager.addPlugin(ExpressWinston);
    PluginManager.addPlugin(Logger);
}).catch((err) => { console.log(err); });
