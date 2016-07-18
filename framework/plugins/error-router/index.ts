/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as express from 'express';

import { NotFoundError } from '../../errors/notfound';

@Plugin
export default class ErrorRouter {
    @InitPhase
    @After('Express:load')
    @Before('Express:run')
    load() {
        console.log('load error routes');

        const app = PluginManager.getService('express');

        // set up our general 404 error handler
        app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
            // pass it down to the general error handler
            next(new NotFoundError('404 error occurred while attempting to load ' + req.url));
        });

        // the catch all and, general error handler. use next(err) to send it through this
        app.use(require(__dirname + '/error-handler'));
    }
}
