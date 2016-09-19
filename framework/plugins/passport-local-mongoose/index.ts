/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// TODO: how do we get the user model? and LoginLocker

// TODO: can we add a hook to serialize more depending on user input?
function serializeUser(user, done) {
    done(null, user.id);
}

function deserializeUser(req, userid, done) {
    User.findOne({id: userid}, function(err, user) {
      done(err, user);
    });
}

@Plugin
export default class PassportLocalMongoose {
    @InitPhase
    @After('ExpressMongooseSession:load')
    @After('Mongoose:load')
    @After('Passport:load')
    load() {
        console.log('load Passport');

        const LoginLocker = require('./LoginLocker');

        const app = PluginManager.getService('express');

        passport.serializeUser(serializeUser);
        passport.deserializeUser(deserializeUser);

        passport.use('login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function(req, email, password, done) {
            var lowerEmail = email.toLowerCase();

            var userPromise = User.findOne({
                email: lowerEmail,
                role: {$ne: 'noaccess'},
                deactivatedat: null
            });

            var lockerPromise = LoginLocker.findOne({email: lowerEmail});

            Promise.all([
                userPromise,
                lockerPromise
            ]).then(function(results) {
                let [user, lockInfo] = results;

                if (lockInfo && lockInfo.lockedUntil && new Date() <= lockInfo.lockedUntil) {
                    // do absolutely nothing if locked
                    return done(null, false);
                }

                // TODO: add audit log

                let ret = false;

                var checkPassword = user ? user.password : 'THISISNOTVALIDPASSWORD';
                return bcrypt.compareAsync(password, checkPassword).then(function(isValid) {
                    if (isValid) {
                        ret = user;
                        if (lockInfo) {
                            lockInfo.failedCount = 0;
                            return lockInfo.save().then(function() {
                                return user;
                            });
                        } else {
                            return user;
                        }
                    } else {
                        if (!lockInfo) {
                            lockInfo = new LoginLocker();
                        }
                        // TODO: can we make this atomic?
                        lockInfo.failedCount += 1;

                        var maxFailTries = parseInt(nconf.get('maxFailTries'), 10);
                        var maxLockTime = parseInt(nconf.get('maxLockTime'), 10);
                        if (lockInfo.failedCount > maxFailTries) {
                            lockInfo.lockedUntil = Math.min(
                                maxLockTime,
                                Math.pow(lockInfo.failedCount - maxFailTries, 2) * 5
                            );
                        }

                        return lockInfo.save().then(function() {
                            return false;
                        });
                    }
                });
            })
            .then(function(ret) {
                done(null, ret);
            })
            .catch(done);
        }));

        // TODO: configurable
        app.post('/login', function(req, res, next) {
        });
    }
}
