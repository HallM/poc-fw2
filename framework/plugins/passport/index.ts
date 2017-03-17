/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';

import * as passport from 'passport';
import generalLogin from './general-login'

@Plugin
export default class Passport {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('express')
    @After('ExpressSession:load')
    load(logger, app) {
        logger.debug('load Passport');

        app.use(passport.initialize());
        app.use(passport.session());

        passport.authAndRegen = function(type) {
            return function(req, res, next) {
                passport.authenticate(type, function(err, user) {
                    if (err) {
                        return next(err);
                    }

                    generalLogin(req, user, next);
                })(req, res, next);
            };
        }
    }
}
