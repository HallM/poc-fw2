/// <reference path="_all.d.ts" />

'use strict';

import { PluginManager } from '../system-manager/';
export { PluginManager } from '../system-manager/';

export { Query, Param, Header, Body } from './plugins/express-controllers/decorators/req-param';
export { UrlHandler } from './plugins/express-controllers/decorators/url-handler';
export { Middleware } from './plugins/express-controllers/decorators/middleware';
export { Method } from './plugins/express-controllers/decorators/method';

import * as fs from 'fs';
import * as path from 'path';

// this is really just a bundle of things

PluginManager.batchLoad((batchLoader) => {
    require('./plugins/config/');
    require('./plugins/express/');
    require('./plugins/body-parser/');
    require('./plugins/cookie-parser/');
    require('./plugins/dust-view/');
    require('./plugins/error-router/');
    require('./plugins/express-compression/');
    require('./plugins/express-security/');
    require('./plugins/express-session/');
    require('./plugins/express-winston/');
    require('./plugins/express-static/');
    require('./plugins/logger/');

    require('./plugins/express-controllers/');
    require('./plugins/dust-express-auto-routes/');
    // require('./plugins/express-mongoose-session/');
    // require('./plugins/mongoose/');
    // require('./plugins/passport/');
    // require('./plugins/passport-mongoose-provider/');
    // require('./plugins/passport-local/');
    // require('./plugins/passport-rememberme/');

    // batchLoader.linkDependentToDependency('ExpressControllers:load', 'PassportLocal:load');
    // batchLoader.linkDependentToDependency('ExpressControllers:load', 'PassportRememberme:load');

    // require('./plugins/email-service/');
    // require('./plugins/rackspace-uploads/');
}).then(() => {
    const logger = PluginManager.getService('logger');
    logger.info('Server is ready');
}).catch((err) => {
    console.error(err);
});
