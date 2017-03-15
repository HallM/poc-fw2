/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as session from 'express-session';

@Plugin
export default class ExpressSession {
    @InitPhase
    @After('Config:load')
    @After('Express:load')
    @After('CookieParser:load')
    @After('PublicRoute:load')
    load() {
        console.log('load sessions');
        const app = PluginManager.getService('express');
        const sessionStore = PluginManager.getService('sessionStore') || (new session.MemoryStore());

        const config = PluginManager.getService('config');

        config.defaults({
            sessionSecret: 'iamakeyboardcatbutnotreally'
        });

        app.use(session({
            store: sessionStore,
            secret: config.get('sessionSecret'),
            resave: true,
            saveUninitialized: true
        }));
    }
}
