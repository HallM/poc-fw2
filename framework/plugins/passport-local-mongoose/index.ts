/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

const bluebird = require('bluebird');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

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
                enableRememberMe: true,
                enableTokenLogin: true,

                postLoginUrl: '/admin/',
                postLogoutUrl: '/',
                postErrorUrl: '/login',
                redirectOn401: '/login',

                // after this many tries, start locks
                maxFailTries: 5,

                // maximum amount of a time an account may be locked for
                maxLockTime: 1 * 3600 * 1000
            }
        });

        const LoginLocker = require('./login-locker');
        const RememberToken = require('./remember-token');
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

        passport.use('login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            bluebird.coroutine(function*() {
                const lowerEmail = email.toLowerCase();

                let [user, lockInfo] = yield Promise.all([
                    User.findOne({
                        email: lowerEmail,
                        role: {$ne: 'noaccess'},
                        deactivatedat: null
                    }),

                    LoginLocker.findOne({email: lowerEmail})
                ]);

                if (lockInfo && lockInfo.lockedUntil && new Date() <= lockInfo.lockedUntil) {
                    // do absolutely nothing if locked
                    return false;
                }

                // TODO: add audit log

                const checkPassword = user ? user.password : 'THISISNOTVALIDPASSWORD';
                const isValid = yield bcrypt.compare(password, checkPassword);

                if (isValid) {
                    if (lockInfo) {
                        lockInfo.failedCount = 0;
                        yield lockInfo.save();
                    }

                    return user;
                } else {
                    if (!lockInfo) {
                        lockInfo = new LoginLocker();
                    }
                    // TODO: can we make this atomic?
                    lockInfo.failedCount += 1;

                    const maxFailTries = parseInt(config.get('passportLocalMongoose.maxFailTries'), 10);
                    const maxLockTime = parseInt(config.get('passportLocalMongoose.maxLockTime'), 10);
                    if (lockInfo.failedCount > maxFailTries) {
                        lockInfo.lockedUntil = Math.min(
                            maxLockTime,
                            Math.pow(lockInfo.failedCount - maxFailTries, 2) * 5
                        );
                    }

                    yield lockInfo.save();
                    return false;
                }
            })().then(function(toReturn) {
                done(null, toReturn);
                return null;
            }).catch(done);
        }));

        // TODO: configurable
        app.post('/login', function(req, res, next) {
            passport.authenticate('local', function(err, user) {
                if (err) {
                    return next(err);
                }

                // passport's default behavior is not to prevent session fixation, so we do it ourselves
                generalLogin(req, user, next);
            })(req, res, next);
        }, function(req, res) {
            const redirectTo = (req.session.redirectto ? req.session.redirectto : null) || postLoginUrl;
            res.okRedirect(redirectTo, {status: true});
        }, function(err, req, res, _next) {
            if (!req.wantsJSON) {
                req.flash(err.message);
            }
            res.okRedirect(postErrorUrl, {status: false, error: err});
        });

        if (config.get('passportLocalMongoose.enableTokenLogin')) {
            passport.use('token', new LocalStrategy({
                usernameField: 'email',
                passwordField: 'token',
                passReqToCallback: true
            },
            function(req, email, token, done) {
                bluebird.coroutine(function*() {
                    const lowerEmail = email.toLowerCase();

                    let [user, lockInfo] = yield Promise.all([
                        User.findOne({
                        email: lowerEmail,
                        role: {$ne: 'noaccess'},
                        deactivatedat: null,
                        tokenexpire: {$gte: new Date()}
                        }),

                        LoginLocker.findOne({email: lowerEmail})
                    ]);

                    if (lockInfo && lockInfo.lockedUntil && new Date() <= lockInfo.lockedUntil) {
                        // do absolutely nothing if locked
                        return false;
                    }

                    const checkToken = user ? user.logintoken : 'THISISNOTVALIDPASSWORD';
                    const isValid = yield bcrypt.compare(token, checkToken);

                    // we don't mess with the lock out with tokens, but we could
                    if (!isValid) {
                        return false;
                    }

                    user.logintoken = null;
                    user.tokenexpire = null;
                    yield user.save();

                    return user;
                })().then(function(toReturn) {
                    done(null, toReturn);
                    return null;
                }).catch(done);
            }));
        }

    }
}

function generalLogin(req, user, done) {
    if (!user) {
        return done(ServerErrors.NotAuthorized('Invalid username or password'));
    }

    if (user.isLocked) {
        return done(ServerErrors.AccountLocked('User account is locked'));
    }

    const saveRedirectTo = req.session.redirectto;

    req.session.regenerate(function() {
        req.logIn(user, function(err) {
            if (err) {
                return done(err);
            }

            // if there's anything specific about the session that needs to be stored
            req.session.startAt = new Date().getTime();
            if (saveRedirectTo) {
                req.session.redirectto = saveRedirectTo;
            }
            done();
        });
    });
}