/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import * as compression from 'compression';

export default class ExpressCompression {
    @InitPhase
    @Inject(['logger', 'express'])
    load(logger, app) {
        logger.debug('load compression');

        app.use(compression());
    }
}
