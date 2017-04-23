/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import * as cookieParser from 'cookie-parser';

export default class CookieParser {
    @InitPhase
    @Inject(['logger', 'express'])
    load(logger, app) {
        logger.debug('load cookie parser');

        app.use(cookieParser());
    }
}
