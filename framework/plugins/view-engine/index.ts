/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import * as path from 'path';

import * as express from 'express';

import { serviceManager } from '../../';
import { InjectServiceMetaKey } from '../../../service-manager/';

var expressLisplate = require('express-lisplate');

export default class ViewEngine {
    static pluginName: string = 'view-engine'

    @Event
    @WaitOn('express:load')
    @Block('express-compression:load')
    load(app) {
        console.log('load view engine');

        const ext = 'ltml';
        const viewDir = '';

        app.engine(ext, expressLisplate({
            viewModelDirectory: function(templateName) {
                var modelpath = path.resolve(templateName + '.js');
                var viewmodel = null;
                try {
                    viewmodel = require(modelpath);
                } catch(e) {
                }

                // TODO: do injections

                return viewmodel;
            },

             stringsDirectory: ''
        }));
        app.set('view engine', ext);
        app.set('views', viewDir);

        app.use(expressLisplate.localizationInit);

        // app.use(function(req: express.Request, res: any, next: express.NextFunction) {
        //     res.streamPage = function(page) {
        //         const svc = serviceManager.makeRequestContext();
        //         svc.addService('req', req);
        //         svc.addService('res', res);

        //         let localstack = dust.makeBase({});
        //         localstack = localstack.push(svc);

        //         dust.stream(page, localstack).pipe(res);
        //     };

        //     next();
        // });
    }
}
