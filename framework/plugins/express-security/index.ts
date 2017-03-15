/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as csrf from 'csrf';

@Plugin
export default class ExpressSecurity {
    @InitPhase
    @After('Config:load')
    @After('Express:load')
    @After('BodyParser:load')
    @Before('RouteLoader:load', false)
    load() {
        console.log('load express-security');
        const app = PluginManager.getService('express');

        const config = PluginManager.getService('config');

        config.defaults({
            expressSecurity: {
                requireHttps: false
            }
        });

        const requireHttps = config.get('expressSecurity.requireHttps');
        if (requireHttps === true || requireHttps === 'true') {
            app.use(function(req, res, next) {
                if (req.headers['x-forwarded-proto'] !== 'https') {
                    return res.redirect(['https://', req.get('Host'), req.url].join(''));
                }

                res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
                next();
            });
        }

        // enable CSRF protection
        const csrfMiddleware = csrf({cookie: true});
        app.use(function(req, res, next) {
            // ignore the multipart ones, to do multer, then enable csrf after
            if (req.headers['content-type'] && req.headers['content-type'].substr(0, 19).toLowerCase() === 'multipart/form-data') {
                next();
                return;
            }

            csrfMiddleware(req, res, next);
        });

        // enable other protections for the site
        app.use(function(req, res, next) {
            res.header('X-XSS-Protection', '1; mode=block');
            res.header('X-FRAME-OPTIONS', 'SAMEORIGIN');

            let csrfToken = null;
            res.locals._csrf = function() {
                if (!csrfToken) {
                    csrfToken = req.csrfToken();
                }
                return csrfToken;
            };
            next();
        });
    }
}
