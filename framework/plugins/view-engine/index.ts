/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import * as path from 'path';

import * as express from 'express';

import { serviceManager } from '../../';
import { InjectServiceMetaKey } from '../../../service-manager/';
import { ReqParamMetaKey } from '../../decorators/req-param';

import { ReqParamMetaKey } from '../../decorators/req-param';

function GetParam(type: string, name: string) {
    return function(target: any, propertyKey: string) {
        let servicesToInject: any = Reflect.getOwnMetadata(ReqParamMetaKey, target) || {};
        servicesToInject[propertyKey] = {type: type, name: name};
        Reflect.defineMetadata(ReqParamMetaKey, servicesToInject, target);
    }
}


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

                                const needinjects: string[] = Reflect.getMetadata(InjectServiceMetaKey, vm) || [];

                                // Now do injections
                                // but... components wind up not having access to these
                                // is that a problem, or not? are pages the only thing allowed to have these?
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

            res.locals.$_svc = serviceManager.makeRequestContext();
            next();
        });
    }
}
