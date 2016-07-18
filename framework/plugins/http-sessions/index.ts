/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

var session = require('express-session');

@Plugin
export default class HttpSessions {
    @InitPhase
    @After('Express:load')
    @After('CookieParser:load')
    @After('StaticRoutes:load')
    load() {
        console.log('load sessions');
        const app = PluginManager.getService('express');
        app.use(session({
            // store: sessionStore,
            secret: 'keyboardcattodo',
            resave: true,
            saveUninitialized: true
        }));
    }
}
