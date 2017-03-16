/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as compression from 'compression';

@Plugin
export default class ExpressCompression {
    @InitPhase
    @After('Logger:load')
    @After('Express:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load compression');

        const app = PluginManager.getService('express');
        app.use(compression());
    }
}
