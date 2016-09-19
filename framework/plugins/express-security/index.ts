/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

const csrf = require('csurf');

@Plugin
export default class ExpressSecurity {
    @InitPhase
    @After('Express:load')
    @After('BodyParser:load')
    @Before('RouteLoader:load', false)
    load() {
        console.log('load express-security');
        const app = PluginManager.getService('express');
        // enable CSRF protection
        app.use(csrf({
            cookie: true
        }));

        // enable other protections for the site
        app.use(function(req, res, next) {
            res.header('X-XSS-Protection', '1; mode=block');
            res.header('X-FRAME-OPTIONS', 'SAMEORIGIN');
            res.locals._csrf = req.csrfToken();
            next();
        });
    }
}
