/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as cookieParser from 'cookie-parser';

@Plugin
export default class CookieParser {
    @InitPhase
    @After('Express:load')
    load() {
        console.log('load cookie parser');
        const app = PluginManager.getService('express');
        app.use(cookieParser());
    }
}
