// load everything in the controllers directory

// recursively (because subpaths become important!)
// for each file required in:
// get every handler with a URL attached to it
// get any @Middleware(s) and attach them to the route
// generate a route handler to call the ctrler with any Injects

/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as express from 'express';
import * as path from 'path';

import autoRoutes from './auto-routes';

export default class DustExpressAutoRoutes {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    @After([
        'DustView:load',
        'BodyParser:load',
        'ExpressSecurity:load',
        'ExpressSession:load',
        'ExpressStatic:load',
        'ExpressControllers:load'
    ])
    @Before(['ErrorRouter:load', 'Express:run'])
    load(logger, config, app) {
        logger.debug('load static-auto routes');

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
