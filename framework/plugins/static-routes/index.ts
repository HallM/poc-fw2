/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

import * as express from 'express';

export default class StaticRoutes {
    @Event
    @WaitOn('express:load')
    @WaitOn('express-compression:load')
    load(app) {
        console.log('load static routes');
        app.use(express.static('public'));
    }
}
