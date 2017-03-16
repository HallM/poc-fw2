/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, GetProvider } from '../../../system-manager/';

import * as bodyParser from 'body-parser';

@Plugin
export default class BodyParser {
    @InitPhase
    @GetProvider('logger')
    @GetProvider('config')
    @GetProvider('express')
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
