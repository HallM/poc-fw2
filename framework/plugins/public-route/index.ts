/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';

import * as express from 'express';

@Plugin
export default class PublicRoute {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('express')
    @After('ExpressCompression:load')
    @Before('ExpressSession:load')
    @Before('ExpressWinston:load')
    @Before('Express:run')
    load(logger, app) {
        logger.debug('load public-directory static route');

        app.use(express.static('public'));
    }
}
