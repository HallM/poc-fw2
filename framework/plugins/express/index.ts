/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as express from 'express';

@Plugin
export default class Express {
    app: any

    @InitPhase
    load() {
        console.log('load express');
        this.app = express();
        PluginManager.exposeService('express', this.app);
    }

    @InitPhase
    @After('Express:load')
    run() {
        return new Promise(resolve => {
            var port = process.env.PORT || 3000;
            var server = this.app.listen(port, function() {
                console.log('App listening on port %s', port);
                resolve(server);
            });
        });
    }
}
