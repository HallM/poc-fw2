/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import passport from 'passport';
import { Strategy } from 'passport-remember-me';

export default class PassportRememberme {
    @InitPhase
    @Inject(['logger', 'config', 'express', 'passport-impl'])
    @After(['ExpressSession:load', 'Passport:load'])
    @Before('PassportLocal:load')
    load(logger, config, app, PassportImpl) {
        logger.debug('load Passport-rememberme');

        config.defaults({
            passportRememberme: {
                enabled: false
            }
        });

        if (config.get('passportRememberme:enabled')) {
            passport.use(new Strategy(function(token, done) {
                PassportImpl.consumeRememeberToken(token).then((user) => {
                    if (!user) {
                        return done(null, false);
                    }

                    done(null, user);
                    return null;
                }).catch(done);
            },
            function(user, done) {
                PassportImpl.createRememeberToken(user).then((token) => {
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

                PassportImpl.createRememeberToken(req.user).then((token) => {
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
    @Inject(['logger', 'config', 'express'])
    @After(['Logger:load', 'Config:load', 'Express:load'])
    @After(['ExpressSession:load', 'Passport:load', 'PassportLocal:load'])
    addHandler(logger, config, app) {
        logger.debug('Passprort remember-me handler');

        if (config.get('passportRememberme:enabled')) {
            app.use(passport.authenticate('remember-me'));
        }
    }
}
