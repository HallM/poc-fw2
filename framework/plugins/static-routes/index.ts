/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as express from 'express';

@Plugin
export default class StaticRoutes {
    @InitPhase
    @After('Express:load')
    @After('ExpressCompression:load')
    load() {
        console.log('load static routes');
        const app = PluginManager.getService('express');
        app.use(express.static('public'));
    }
}
