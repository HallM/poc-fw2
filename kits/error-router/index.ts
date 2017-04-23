/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import * as express from 'express';

import { NotFoundError } from '../../http-errors/notfound';

export default class ErrorRouter {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    @Before('Express:run')
    load(logger, config, app) {
        logger.debug('load error routes');

        config.defaults({
            errorRouter: {
                redirectOn401: '/login'
            }
        });

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
