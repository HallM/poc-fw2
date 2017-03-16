/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as winston from 'winston';

@Plugin
export default class Logger {
    @InitPhase
    @After('Config:load')
    load() {
        winston.debug('load Winston');

        const config = PluginManager.getService('config');

        config.defaults({
            logger: {
                logLevel: 'info'
            }
        });

        winston.level = config.get('logger:logLevel');
        PluginManager.exposeService('logger', winston);
    }
}
