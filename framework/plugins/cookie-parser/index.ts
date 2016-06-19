/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

var cookieParser = require('cookie-parser');

export default class BodyParser {
    static pluginName: string = 'cookie-parser'

    @Event
    @WaitOn('express:load')
    load(app) {
        console.log('load cookie parser');
        app.use(cookieParser());
    }
}
