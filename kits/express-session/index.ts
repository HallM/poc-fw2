/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as session from 'express-session';

export default class ExpressSession {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    @Inject('sessionStore', false)
    @After(['CookieParser:load', 'ExpressStatic:load'])
    load(logger, config, app, sessionStore) {
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