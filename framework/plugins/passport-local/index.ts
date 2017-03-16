/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import passport from 'passport';

import configureLocal from './configure-local';
import configureToken from './configure-token';

@Plugin
export default class PassportLocal {
    @InitPhase
    @After('ExpressSession:load')
    @After('Passport:load')
    load() {
        console.log('load Passport-local');

        const config = PluginManager.getService('config');

        config.defaults({
            passportLocal: {
                loginPostRoute: '/auth/login',
                tokenPostRoute: '/auth/token',

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

        const settings = config.get('passportLocal');
        const PassportProvider = PluginManager.getService('passport-provider');
        const app = PluginManager.getService('express');

        passport.serializeUser(function serializeUser(user, done) {
            const info = PassportProvider.serializeUserToSession(user);
            done(null, info);
        });

        passport.deserializeUser(function deserializeUser(req, info, done) {
            PassportProvider.deserializeUserFromSession(info).then((user) => {
                done(null, user);
            }).catch(done);
        });

        configureLocal(app, PassportProvider, settings);

        if (settings.enableTokenLogin) {
            configureToken(app, PassportProvider, settings);
        }

        app.get('/logout', function(req, res) {
            res.clearCookie('remember_me');
            req.logout();
            req.session.destroy(function() {
                res.okRedirect(settings.postLogoutUrl, {status: true});
            });
        });
    }
}
