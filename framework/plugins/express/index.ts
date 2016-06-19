/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import { serviceManager } from '../../';

import * as express from 'express';

export default class Express {
    static pluginName: string = 'express'

    @Event
    load() {
        console.log('load express');
        const app = express();
        serviceManager.addService('express', app);
        return app;
    }

    @Event
    @WaitOn('express:load')
    run(app) {
        return new Promise(resolve => {
            var port = process.env.PORT || 3000;
            var server = app.listen(port, function() {
                console.log('App listening on port %s', port);
                resolve(server);
            });
        });
    }
}
