/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as bodyParser from 'body-parser';

@Plugin
export default class BodyParser {
    @InitPhase
    @After('Logger:load')
    @After('Express:load')
    @After('Config:load')
    load() {
        const logger = PluginManager.getService('logger');
        logger.debug('load body parser');

        const config = PluginManager.getService('config');

        config.defaults({
            expressBody: {
                enableUrlEncoded: true,
                enableJson: true
            }
        });

        const app = PluginManager.getService('express');

        if (config.get('expressBody:enableUrlEncoded')) {
            app.use(bodyParser.urlencoded({ extended: true }));
        }
        if (config.get('expressBody:enableJson')) {
            app.use(bodyParser.json());
        }
    }
}
