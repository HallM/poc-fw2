/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import mongoose from 'mongoose';
import * as session from 'express-session';
import * as ConnectMongo from 'connect-mongo';

const MongoStore = ConnectMongo(session);

export default class ExpressMongooseSession {
    @InitPhase
    @ReturnsService('sessionStore')
    @Inject(['logger', 'express'])
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
