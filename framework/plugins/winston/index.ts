/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as winston from 'winston';

@Plugin
export default class Winston {
    @InitPhase
    @After('Config:load')
    load() {
        console.log('load Winston');

        const config = PluginManager.getService('config');

        config.defaults({
            winston: {
                logLevel: 'info'
            }
        });

        winston.level = config.get('winston:logLevel');
        PluginManager.exposeService('logger', winston);
    }
}
