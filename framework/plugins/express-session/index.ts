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
    load(config, logger, app, sessionStore) {
        logger.debug('load sessions');

        config.defaults({
            sessionSecret: 'iamakeyboardcatbutnotreally'
        });

        app.use(session({
            store: sessionStore || (new session.MemoryStore()),
            secret: config.get('sessionSecret'),
            resave: true,
            saveUninitialized: true
        }));
    }
}
