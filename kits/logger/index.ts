/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as winston from 'winston';

export default class Logger {
    @InitPhase
    @ReturnsService('logger')
    @Inject('config')
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
