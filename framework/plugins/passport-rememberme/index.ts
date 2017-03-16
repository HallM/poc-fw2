/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import passport from 'passport';
import { Strategy } from 'passport-remember-me';

@Plugin
export default class PassportRememberme {
    @InitPhase
    @After('Logger:load')
    @After('ExpressSession:load')
    @After('Passport:load')
    @Before('PassportLocal:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load Passport-rememberme');

        const PassportProvider = PluginManager.getService('passport-provider');

        const app = PluginManager.getService('express');
        const config = PluginManager.getService('config');

        config.defaults({
            passportRememberme: {
                enabled: false
            }
        });

        if (config.get('passportRememberme:enabled')) {
            passport.use(new Strategy(function(token, done) {
                PassportProvider.consumeRememeberToken(token).then((user) => {
                    if (!user) {
                        return done(null, false);
                    }

                    done(null, user);
                    return null;
                }).catch(done);
            },
            function(user, done) {
                PassportProvider.createRememeberToken(user).then((token) => {
                    done(null, token);
                }).catch(done);
            }));

            app.post(config.get('passportLocal:loginPostRoute'), function(req, res, next) {
                if (!req.user) {
                    return next();
                }

                if (req.method.toLowerCase() !== 'post' || !(req.body.rememberme === true || req.body.rememberme === 'true')) {
                    return next();
                }

                PassportProvider.createRememeberToken(req.user).then((token) => {
                    let cookieInfo:any = {path: '/', httpOnly: true, maxAge: 2 * 7 * 24 * 3600 * 1000};

                    if (req.protocol.toLowerCase() === 'https') {
                        cookieInfo.secure = true;
                    }

                    res.cookie('remember_me', token, cookieInfo);
                    next();
                }).catch(next);
            });
        }
    }

    @InitPhase
    @After('Logger:load')
    @After('ExpressSession:load')
    @After('Passport:load')
    @After('PassportLocal:load')
    addHandler() {
        const logger = PluginManager.getService('logger');
        logger.debug('Passprort remember-me handler');

        const app = PluginManager.getService('express');
        const config = PluginManager.getService('config');

        if (config.get('passportRememberme:enabled')) {
            app.use(passport.authenticate('remember-me'));
        }
    }
}
