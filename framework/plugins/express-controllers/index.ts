// load everything in the controllers directory

// recursively (because subpaths become important!)
// for each file required in:
// get every handler with a URL attached to it
// get any @Middleware(s) and attach them to the route
// generate a route handler to call the ctrler with any Injects

/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';
import { ReqParamMetaKey } from './decorators/req-param';
import { UrlHandlerMetaKey } from './decorators/url-handler';
import { MiddlewareMetaKey } from './decorators/middleware';
import { MethodMetaKey } from './decorators/method';

export { Query, Param, Header, Body } from './decorators/req-param';
export { UrlHandler } from './decorators/url-handler';
export { Middleware } from './decorators/middleware';
export { Method } from './decorators/method';

import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';

@Plugin
export default class ExpressControllers {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('config')
    @GetProvider('express')
    @After('BodyParser:load')
    @After('ExpressSecurity:load')
    @After('ExpressSession:load')
    @After('PublicRoute:load')
    // @After('PassportLocalMongoose:load') // TODO: make external
    @Before('ErrorRouter:load')
    @Before('Express:run')
    load(logger, config, app) {
        logger.debug('load controllers and routes');

        config.defaults({
            expressControllers: {
              directory: path.resolve(process.cwd(), 'controllers')
            }
        });

        const basedir = path.resolve(config.get('expressControllers:directory'));
        const router = express.Router();

        const files = fs.readdirSync(basedir);

        files.forEach((file) => {
            const filepath = path.resolve(basedir, file);

            if (file.length < 4 || file.substring(file.length - 3) !== '.js') {
                return;
            }

            const fstats = fs.lstatSync(filepath);

            if (!fstats.isFile()) {
                return;
            }

            const ControllerClass = require(filepath).default;
            const controller = new ControllerClass();

            for (const prop in controller) {
                const value: any = controller[prop];
                if (value instanceof Function) {
                    const url: string = Reflect.getMetadata(UrlHandlerMetaKey, controller, prop);
                    const method: string = Reflect.getMetadata(MethodMetaKey, controller, prop) || 'get';

                    if (url) {
                        const middleware: any[] = Reflect.getMetadata(MiddlewareMetaKey, controller, prop) || [];
                        const reqinjects: any[] = Reflect.getMetadata(ReqParamMetaKey, controller, prop) || [];

                        // if there's 4 slots other than the injects, it is an error handler
                        const isError = (value.length - reqinjects.length) === 4;

                        const handler = isError ? function(err, req, res, next) {
                            let args = [err].concat(reqinjects.map((i) => {
                                const reqfield = req[i.type];
                                return reqfield[i.name];
                            })).concat([req, res, next]);

                            value.apply(controller, args);
                        } : function(req, res, next) {
                            let args = [].concat(reqinjects.map((i) => {
                                const reqfield = req[i.type];
                                return reqfield[i.name];
                            })).concat([req, res, next]);

                            value.apply(controller, args);
                        };

                        const routerArgs: any[] = [].concat(url).concat(middleware).concat(handler);
                        router[method].apply(router, routerArgs);
                    }
                }
            }
        });

        app.use(router);
    }
}
