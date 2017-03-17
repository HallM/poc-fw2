/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, GetProvider } from '../../../system-manager/';

import * as cookieParser from 'cookie-parser';

@Plugin
export default class CookieParser {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('express')
    load(logger, app) {
        logger.debug('load cookie parser');

        app.use(cookieParser());
    }
}
