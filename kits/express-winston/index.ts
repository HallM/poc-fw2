/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as expressWinston from 'express-winston';

export default class ExpressWinston {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    @Before('BodyParser:load', false)
    @Before('StaticRoutes:load', false)
    load(logger, config, app) {
        logger.debug('load ExpressWinston');

        config.defaults({
            expressWinston: {
                template: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms ',
                metaLog: process.env.NODE_ENV === 'production',
                expressLog: process.env.NODE_ENV !== 'production',
                statusLevels: true
            }
        });

        app.use(expressWinston.logger({
            winstonInstance: logger,
            statusLevels: !!config.get('expressWinston:statusLevels'),
            expressFormat: !!config.get('expressWinston:expressLog'),
            msg: config.get('expressWinston:template')
        }));
    }
}
