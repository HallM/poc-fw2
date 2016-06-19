/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

import * as express from 'express';

export default class Express {
    @Event
    load() {
        console.log('load express');
        return express();
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
