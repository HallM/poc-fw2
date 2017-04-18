/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as cookieParser from 'cookie-parser';

export default class CookieParser {
    @InitPhase
    @Inject(['logger', 'express'])
    load(logger, app) {
        logger.debug('load cookie parser');

        app.use(cookieParser());
    }
}
