/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import * as path from 'path';

import * as express from 'express';

import { serviceManager } from '../../';
import { InjectServiceMetaKey } from '../../../service-manager/';
import { ReqParamMetaKey } from '../../decorators/req-param';

var expressLisplate = require('express-lisplate');

interface ViewModelInterface {
  new(data: any): ViewModelInterface
}

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
                    var vm: ViewModelInterface = require(modelpath);

                    viewmodel = class ViewModel extends vm {
                        constructor(data) {
                            super(data);
                            if (data && data.$_svc) {
                                var svc = data.$_svc;
                                var req = svc.getService('req');

                                const needinjects: any = Reflect.getMetadata(InjectServiceMetaKey, this) || {};
                                const reqinjects: any = Reflect.getMetadata(ReqParamMetaKey, this) || {};

                                for (let p in needinjects) {
                                    this[p] = svc.getService(needinjects[p]);
                                }
                                for (let p in reqinjects) {
                                    const reqfield = req[reqinjects[p].type];
                                    this[p] = reqfield[reqinjects[p].name];
                                }
                            }
                        }
                    };
                } catch(e) {
                }

                return viewmodel;
            },

             stringsDirectory: ''
        }));
        app.set('view engine', ext);
        app.set('views', viewDir);

        app.use(expressLisplate.localizationInit);

        app.use(function(req: express.Request, res: any, next: express.NextFunction) {
        //     res.streamPage = function(page) {
        //         const svc = serviceManager.makeRequestContext();
        //         svc.addService('req', req);
        //         svc.addService('res', res);

        //         let localstack = dust.makeBase({});
        //         localstack = localstack.push(svc);

        //         dust.stream(page, localstack).pipe(res);
        //     };

            const svc = serviceManager.makeRequestContext();
            svc.addService('req', req);
            svc.addService('res', res);
            res.locals.$_svc = svc;
            next();
        });
    }
}
