/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as compression from 'compression';

@Plugin
export default class ExpressCompression {
    @InitPhase
    @After('Express:load')
    load() {
        console.log('load compression');
        const app = PluginManager.getService('express');
        app.use(compression());
    }
}
