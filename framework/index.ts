/// <reference path="_all.d.ts" />

'use strict';

import { PluginManager } from '../system-manager/';
export { PluginManager } from '../system-manager/';

import * as fs from 'fs';
import * as path from 'path';

// this is really just a bundle of things

PluginManager.batchLoad(() => {
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
    require('./plugins/public-route/');
    // require('./plugins/route-loader/');
    require('./plugins/winston/');

    // require('./plugins/email-service/');
    // require('./plugins/express-mongoose-session/');
    // require('./plugins/mongoose/');
    // require('./plugins/passport/');
    // require('./plugins/passport-local-mongoose/');
    // require('./plugins/rackspace-uploads/');
}).then(() => {
    console.log('Server is ready')
}).catch((err) => {
    console.log(err);
});
