/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Provides, GetProvider } from '../../../system-manager/';

import * as express from 'express';

@Plugin
export default class Express {
    @InitPhase
    @GetProvider('logger')
    @Provides('express')
    create() {
        const logger = PluginManager.getService('logger');
        logger.debug('load express');

        const app = express();
        return app;
    }

    @InitPhase
    @GetProvider('logger')
    @GetProvider('config')
    @GetProvider('express')
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
