/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as express from 'express';

export default class Express {
    @InitPhase
    @ReturnsService('express')
    @Inject('logger')
    load(logger) {
        logger.debug('load express');

        const app = express();
        return app;
    }

    @InitPhase
    @Inject(['logger', 'config', 'express'])
    run(logger, config, app) {
        logger.debug('starting express');

        config.defaults({
            PORT: 3000
        });

        return new Promise(resolve => {
            const port = config.get('PORT');
            const server = app.listen(port, function() {
                logger.info('App listening on port %s', port);
                resolve(server);
            });
        });
    }
}
