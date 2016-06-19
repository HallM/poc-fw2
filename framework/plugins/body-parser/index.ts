/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

var bodyParser = require('body-parser');

export default class BodyParser {
    @Event
    @WaitOn('express:load')
    load(app) {
        console.log('load body parser');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
    }
}
