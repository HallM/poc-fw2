/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Provides, GetProvider } from '../../../system-manager/';

import mongoose from 'mongoose';
import * as session from 'express-session';
import * as ConnectMongo from 'connect-mongo';

const MongoStore = ConnectMongo(session);

@Plugin
export default class ExpressMongooseSession {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('express')
    @Provides('sessionStore')
    @After('Mongoose:load')
    load(logger, app) {
        logger.debug('create mongostore for express-sessions using mongoose');

        const sessionStore = new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 14 * 24 * 3600,
            touchAfter: 3600,
        });

        return sessionStore;
    }
}
