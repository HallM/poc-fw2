/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

const expressWinston = require('express-winston');

@Plugin
export default class ExpressWinston {
    @InitPhase
    @After('Winston:load')
    @After('Express:load')
    @Before('BodyParser:load', false)
    @Before('StaticRoutes:load', false)
    load() {
        console.log('load ExpressWinston');
        const app = PluginManager.getService('express');
        const winston = PluginManager.getService('logger');

        app.use(function(req, res, next) {
            if (process.env.NODE_ENV === 'testing') {
                return next();
            }

            var metaLog = inProduction;
            var expressLog = !inProduction;

            return expressWinston.logger({
                winstonInstance: winston,
                statusLevels: true,
                expressFormat: expressLog,
                msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms ',
                meta: metaLog
            })(req, res, next);
        });
    }
}
