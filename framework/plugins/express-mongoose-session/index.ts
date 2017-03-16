/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import mongoose from 'mongoose';
import * as session from 'express-session';
import * as ConnectMongo from 'connect-mongo';

const MongoStore = ConnectMongo(session);

@Plugin
export default class ExpressMongooseSession {
    @InitPhase
    @After('Logger:load')
    @Before('ExpressSession:load')
    @After('Mongoose:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('create mongostore for express-sessions using mongoose');

        const app = PluginManager.getService('express');

        const sessionStore = new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 14 * 24 * 3600,
            touchAfter: 3600,
        });

        PluginManager.exposeService('sessionStore', sessionStore);
    }
}
