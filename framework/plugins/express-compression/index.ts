/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';

import * as compression from 'compression';

@Plugin
export default class ExpressCompression {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('express')
    load(logger, app) {
        logger.debug('load compression');

        app.use(compression());
    }
}
