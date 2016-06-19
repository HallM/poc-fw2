/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

var compression = require('compression');

export default class ExpressCompression {
    @Event
    @WaitOn('express:load')
    load(app) {
        console.log('load compression');
        app.use(compression());
    }
}
