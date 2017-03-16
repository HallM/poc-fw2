/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as express from 'express';

@Plugin
export default class Express {
    app: any

    @InitPhase
    @After('Logger:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load express');

        this.app = express();
        PluginManager.exposeService('express', this.app);
    }

    @InitPhase
    @After('Config:load')
    @After('Logger:load')
    @After('Express:load')
    run() {
        const logger = PluginManager.getService('logger');
        logger.debug('starting express');

        const config = PluginManager.getService('config');

        config.defaults({
            PORT: 3000
        });

        return new Promise(resolve => {
            const port = config.get('PORT');
            const server = this.app.listen(port, function() {
                logger.info('App listening on port %s', port);
                resolve(server);
            });
        });
    }
}
