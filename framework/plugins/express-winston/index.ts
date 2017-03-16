/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as expressWinston from 'express-winston';

@Plugin
export default class ExpressWinston {
    @InitPhase
    @After('Config:load')
    @After('Logger:load')
    @After('Express:load')
    @Before('BodyParser:load', false)
    @Before('StaticRoutes:load', false)
    load() {
        const winston = PluginManager.getService('logger');
        winston.debug('load ExpressWinston');

        const app = PluginManager.getService('express');

        const config = PluginManager.getService('config');

        config.defaults({
            expressWinston: {
                template: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms ',
                metaLog: process.env.NODE_ENV === 'production',
                expressLog: process.env.NODE_ENV !== 'production',
                statusLevels: true
            }
        });

        app.use(function(req, res, next) {
            if (process.env.NODE_ENV === 'testing') {
                return next();
            }

            return expressWinston.logger({
                winstonInstance: winston,
                statusLevels: !!config.get('expressWinston:statusLevels'),
                expressFormat: !!config.get('expressWinston:expressLog'),
                msg: config.get('expressWinston:template'),
                meta: !!config.get('expressWinston:metaLog')
            })(req, res, next);
        });
    }
}
