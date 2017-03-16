/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as express from 'express';

import { NotFoundError } from '../../errors/notfound';

@Plugin
export default class ErrorRouter {
    @InitPhase
    @After('Config:load')
    @After('Logger:load')
    @After('Express:load')
    @Before('Express:run')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load error routes');

        const config = PluginManager.getService('config');

        config.defaults({
            errorRouter: {
                redirectOn401: '/login'
            }
        });

        const app = PluginManager.getService('express');
        app.set('redirectOn401', config.get('errorRouter:redirectOn401'));

        // set up our general 404 error handler
        app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
            // pass it down to the general error handler
            next(new NotFoundError('404 error occurred while attempting to load ' + req.url));
        });

        // the catch all and, general error handler. use next(err) to send it through this
        app.use(require('./error-handler')(logger));
    }
}
