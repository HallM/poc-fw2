/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as cookieParser from 'cookie-parser';

@Plugin
export default class CookieParser {
    @InitPhase
    @After('Logger:load')
    @After('Express:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load cookie parser');

        const app = PluginManager.getService('express');
        app.use(cookieParser());
    }
}
