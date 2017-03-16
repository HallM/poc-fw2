/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as crypto from 'crypto';

import passport from 'passport';
import LoginLocker from './login-locker';
import RememberToken from './remember-token';

@Plugin
export default class PassportMongooseProvider {
    @InitPhase
    @After('Logger:load')
    @After('Mongoose:load')
    @Before('PassportLocal:load')
    @Before('PassportRememberme:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load Passport provider (mongoose)');

        const User = PluginManager.getService('user-model');

        const service = {
            findUserById: function(userid) {
                return User.findOne({_id: userid});
            },

            findUserForLogin: function(userfield, username) {
                return User.findOne({
                    [userfield]: username,
                    role: {$ne: 'noaccess'},
                    deactivatedat: null
                });
            },
            findUserForToken: function(userfield, username) {
                return User.findOne({
                    [userfield]: username,
                    role: {$ne: 'noaccess'},
                    deactivatedat: null,
                    tokenexpire: {$gte: new Date()}
                });
            },

            findUserByField: function(field, value) {
                return User.findOne({[field]: value});
            },

            serializeUserToSession: function(user) {
                return user._id.toString();
            },

            deserializeUserFromSession: function(userid) {
                return User.findOne({_id: userid});
            },

            alterUser: function(user, update) {
                for (const prop in update) {
                    user[prop] = update;
                }
                return user.save();
            },

            isLockedOut: function(userfield, username) {
                return LoginLocker.findOne({[userfield]: username}).then((lockInfo) => {
                    return !lockInfo || !lockInfo.lockedUntil || new Date() > lockInfo.lockedUntil;
                });
            },

            incrementLockOut: function(userfield, username, lockedAfter, computeExpires) {
                return LoginLocker.update(
                    {[userfield]: username},
                    {failedCount: {$inc: 1}},
                    {upsert: true}
                ).then(() => {
                    return LoginLocker.findOne({[userfield]: username, failedCount: lockedAfter});
                }).then((locker) => {
                    if (!locker) {
                        return null;
                    }

                    const expiresUnixTime = new Date().getTime() + computeExpires(locker.failedCount);
                    locker.lockedUntil = new Date(expiresUnixTime);
                    return locker.save();
                });
            },

            clearUserLockout: function(userfield, username) {
                return LoginLocker.update({[userfield]: username}, {failedCount: 0});
            },

            createRememeberToken: function(user) {
                return new Promise((resolve, reject) => {
                    crypto.randomBytes(48, function(ex, buf) {
                        if (ex) {
                            return reject(ex);
                        }


                        resolve(buf.toString('hex'));
                    });
                }).then((token) => {
                    const rt = new RememberToken({token: token, user: user._id});
                    return rt.save().then(() => token);
                });
            },

            consumeRememeberToken: function(token) {
                return RememberToken.findOne({token: token}).then((rt) => {
                    if (!rt) {
                        return null;
                    }

                    return RememberToken.remove({token: token}).then(() => rt.user);
                }).then((user) => {
                    if (!user) {
                        return null;
                    }

                    return User.findOne({_id: user});
                });
            }
        };

        PluginManager.exposeService('passport-provider', service);
    }
}
