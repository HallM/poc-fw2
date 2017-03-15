/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as express from 'express';

@Plugin
export default class PublicRoute {
    @InitPhase
    @After('Express:load')
    @After('ExpressCompression:load')
    @Before('ExpressSession:load')
    @Before('ExpressWinston:load')
    @Before('Express:run')
    load() {
        console.log('load public-directory static route');
        const app = PluginManager.getService('express');
        app.use(express.static('public'));
    }
}
