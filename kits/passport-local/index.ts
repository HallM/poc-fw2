/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import passport from 'passport';

import configureLocal from './configure-local';
import configureToken from './configure-token';

export default class PassportLocal {
    @InitPhase
    @Inject(['logger', 'config', 'express', 'passport-impl'])
    @After(['ExpressSession:load', 'Passport:load'])
    load(logger, config, app, PassportImpl) {
        logger.debug('load Passport-local');

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

        passport.serializeUser(function serializeUser(user, done) {
            const info = PassportImpl.serializeUserToSession(user);
            done(null, info);
        });

        passport.deserializeUser(function deserializeUser(req, info, done) {
            PassportImpl.deserializeUserFromSession(info).then((user) => {
                done(null, user);
            }).catch(done);
        });

        configureLocal(app, PassportImpl, settings);

        if (settings.enableTokenLogin) {
            configureToken(app, PassportImpl, settings);
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
