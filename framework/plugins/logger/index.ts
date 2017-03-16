/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Provides, GetProvider } from '../../../system-manager/';

import * as winston from 'winston';

@Plugin
export default class Logger {
    @InitPhase
    @GetProvider('config')
    @Provides('logger')
    load(config) {
        winston.debug('load Winston');

        config.defaults({
            logger: {
                logLevel: 'info'
            }
        });

        winston.level = config.get('logger:logLevel');
        return winston;
    }
}
