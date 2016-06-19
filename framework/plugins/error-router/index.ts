/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

import * as express from 'express';

import { NotFoundError } from '../../errors/notfound';

export default class ErrorRouter {
    static pluginName: string = 'error-router'

    @Event
    @WaitOn('express:load')
    @Block('express:run')
    load(app) {
        console.log('load error routes');

        // set up our general 404 error handler
        app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
            // pass it down to the general error handler
            next(new NotFoundError('404 error occurred while attempting to load ' + req.url));
        });

        // the catch all and, general error handler. use next(err) to send it through this
        app.use(require(__dirname + '/error-handler'));
    }
}
