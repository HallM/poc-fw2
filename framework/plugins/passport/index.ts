/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as passport from 'passport';
import generalLogin from './general-login'

@Plugin
export default class Passport {
    @InitPhase
    @After('ExpressSession:load')
    load() {
        console.log('load Passport');
        const app = PluginManager.getService('express');

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
