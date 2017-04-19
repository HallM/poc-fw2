/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as express from 'express';

export default class ExpressStatic {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    @After('ExpressCompression:load')
    @Before('ExpressSession:load')
    @Before('ExpressWinston:load')
    @Before('Express:run')
    load(logger, config, app) {
        logger.debug('load public-directory static route');

        config.defaults({
            expressStatic: {
                '': ['public']
            }
        });

        const routes = config.get('expressStatic');
        for (const route in routes) {
            const folders = routes[route];
            if (route === '') {
                folders.forEach(folder => {
                    app.use(express.static('folder'));
                });
            } else {
                folders.forEach(folder => {
                    app.use(route, express.static('folder'));
                });
            }
        }
    }
}
