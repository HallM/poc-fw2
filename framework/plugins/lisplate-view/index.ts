/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';
import { ReqParamMetaKey } from '../../decorators/req-param';

import * as path from 'path';
import * as express from 'express';

var expressLisplate = require('express-lisplate');

interface ViewModelInterface {
  new(data: any, strings: any, renderContext: any): ViewModelInterface
}

@Plugin
export default class LisplateView {
    @InitPhase
    @After('Express:load')
    @Before('ExpressCompression:load')
    load() {
        console.log('load view engine');
        const app = PluginManager.getService('express');

        const ext = 'ltml';
        const viewDir = '';

        app.engine(ext, expressLisplate({
            viewModelDirectory: function(templateName) {
                var modelpath = path.resolve(templateName + '.js');
                var viewmodel = null;
                try {
                    var vm: ViewModelInterface = require(modelpath);

                    viewmodel = class ViewModel extends vm {
                        constructor(data, strings, renderContext) {
                            super(data, strings, renderContext);
                            if (renderContext && renderContext.svc) {
                                var svc = renderContext.svc;
                                var req = svc.getService('req');

                                PluginManager.injectInto(this, svc);

                                const reqinjects: any = Reflect.getMetadata(ReqParamMetaKey, this) || {};
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
            const svc = PluginManager.generateScope();
            svc.exposeService('req', req);
            svc.exposeService('res', res);
            if (!res.locals.$_renderContext) {
                res.locals.$_renderContext = {};
            }
            res.locals.$_renderContext.svc = svc;
            next();
        });
    }
}
