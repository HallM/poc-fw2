// load everything in the controllers directory

// recursively (because subpaths become important!)
// for each file required in:
// get every handler with a URL attached to it
// get any @Middleware(s) and attach them to the route
// generate a route handler to call the ctrler with any Injects

/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';

import * as express from 'express';
import * as path from 'path';

import autoRoutes from './auto-routes';

@Plugin
export default class DustExpressAutoRoutes {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('config')
    @GetProvider('express')
    @After('DustView:load')
    @After('BodyParser:load')
    @After('ExpressSecurity:load')
    @After('ExpressSession:load')
    @After('ExpressStatic:load')
    @After('ExpressControllers:load')
    @Before('ErrorRouter:load')
    @Before('Express:run')
    load(logger, config, app) {
        logger.debug('load controllers and routes');

        config.defaults({
            dustAutoRoutes: {
              directory: 'static'
            }
        });

        const directory = config.get('dustAutoRoutes:directory');
        const basedir = path.resolve(app.get('views'), directory);

        app.use(autoRoutes(basedir));
    }
}
