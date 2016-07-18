/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

var bodyParser = require('body-parser');

@Plugin
export default class BodyParser {
    @InitPhase
    @After('Express:load')
    load() {
        console.log('load body parser');
        const app = PluginManager.getService('express');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
    }
}
