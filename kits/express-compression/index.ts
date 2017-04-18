/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as compression from 'compression';

export default class ExpressCompression {
    @InitPhase
    @Inject(['logger', 'express'])
    load(logger, app) {
        logger.debug('load compression');

        app.use(compression());
    }
}
