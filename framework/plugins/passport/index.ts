/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

var passport = require('passport');

@Plugin
export default class Passport {
    @InitPhase
    @After('ExpressSession:load')
    load() {
        console.log('load Passport');
        const app = PluginManager.getService('express');

        app.use(passport.initialize());
        app.use(passport.session());
    }
}
