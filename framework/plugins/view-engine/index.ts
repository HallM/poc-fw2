/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import * as path from 'path';

import * as express from 'express';

import { serviceManager } from '../../';
import { InjectServiceMetaKey } from '../../../service-manager/';

var consolidate = require('consolidate');
var dust = require('../../../dust-fork');

export default class ViewEngine {
    static pluginName: string = 'view-engine'

    @Event
    @WaitOn('express:load')
    @Block('express-compression:load')
    load(app) {
        console.log('load view engine');
        dust.resolveImpl = function(elem) {
            return require(path.resolve('server', elem));
        }
        dust.onInitComponent = function(pagename, context) {
            try {
                const ImplClass = require(path.resolve('server', pagename));
                const data = new ImplClass();

                var svc = context.getTail().head;

                const servicesToInject: any = Reflect.getMetadata(InjectServiceMetaKey, data) || {};
                for (let prop in servicesToInject) {
                    data[prop] = svc.getService(servicesToInject[prop]);
                }

                context = context.push(data);
            } catch(e) {
            }

            return context;
        };

        consolidate.requires.dust = dust;

        const ext = 'dust';
        const viewDir = 'views';

        app.engine('dust', consolidate.dust);
        app.set('view engine', ext);
        app.set('views', viewDir);
        // just pre-loading dustjs
        try {
            consolidate.dust.render('index', {
                ext: ext,
                views: viewDir,
                cache: false
            }, function() {});
        } catch(e) {
        }

        app.use(function(req: express.Request, res: any, next: express.NextFunction) {
            res.streamPage = function(page) {
                const svc = serviceManager.makeRequestContext();
                svc.addService('req', req);
                svc.addService('res', res);

                let localstack = dust.makeBase({});
                localstack = localstack.push(svc);

                dust.stream(page, localstack).pipe(res);
            };

            next();
        });
    }
}
