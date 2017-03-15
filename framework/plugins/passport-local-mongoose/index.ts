/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import passport from 'passport';

import configureLocal from './configure-local';
import configureToken from './configure-token';

@Plugin
export default class PassportLocalMongoose {
    @InitPhase
    @After('ExpressMongooseSession:load')
    @After('Mongoose:load')
    @After('Passport:load')
    load() {
        console.log('load Passport');

        const config = PluginManager.getService('config');

        config.defaults({
            passportLocalMongoose: {
                loginPostRoute: '/auth/login',
                tokenPostRoute: '/auth/token',

                enableRememberMe: true,
                enableTokenLogin: true,

                postLoginUrl: '/admin/',
                postLogoutUrl: '/',
                postErrorUrl: '/login',

                // after this many tries, start locks
                maxFailTries: 5,

                // maximum amount of a time an account may be locked for
                maxLockTime: 1 * 3600 * 1000
            }
        });

        const settings = config.get('passportLocalMongoose');
        const User = PluginManager.getService('user-model');
        const app = PluginManager.getService('express');

        passport.serializeUser(function serializeUser(user, done) {
            // TODO: can we add a hook to serialize more depending on user input?
           done(null, user.id);
        });

        passport.deserializeUser(function deserializeUser(req, userid, done) {
            User.findOne({id: userid}, function(err, user) {
                done(err, user);
            });
        });

        configureLocal(app, User, settings);

        if (settings.enableTokenLogin) {
            configureToken(app, User, settings);
        }

    }
}
