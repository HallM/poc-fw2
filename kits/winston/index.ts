/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import * as winston from 'winston';

export default class WinstonKit {
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
