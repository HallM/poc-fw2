/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';

import * as session from 'express-session';

@Plugin
export default class ExpressSession {
    @InitPhase
    @GetProvider('config')
    @GetProvider('logger')
    @GetProvider('express')
    @GetProvider('sessionStore', false)
    @After('CookieParser:load')
    @After('PublicRoute:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load sessions');

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
