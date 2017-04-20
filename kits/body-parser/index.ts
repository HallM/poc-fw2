/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as bodyParser from 'body-parser';

export default class BodyParser {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    load(logger, config, app) {
        config.defaults({
            expressBody: {
                enableUrlEncoded: true,
                enableJson: true
            }
        });

        if (config.get('expressBody:enableUrlEncoded')) {
            app.use(bodyParser.urlencoded({ extended: true }));
        }
        if (config.get('expressBody:enableJson')) {
            app.use(bodyParser.json());
        }
    }
}
