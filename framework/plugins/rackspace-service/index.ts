/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Provides, GetProvider } from '../../../system-manager/';

import RackspaceService from './rackspace-service';

@Plugin
export default class Logger {
    @InitPhase
    @GetProvider('config')
    @GetProvider('logger')
    @Provides('rackspace')
    load(config, logger) {
        // TODO: no default, just leaving here for the day I have schemas
        // config.defaults({
        //     rackspace: {
        //         container, username, region, apiKey
        //     }
        // });

        config.required([
            'rackspace:container',
            'rackspace:username',
            'rackspace:region',
            'rackspace:apiKey'
        ]);

        const settings = config.get('rackspace');

        return new RackspaceService(
            settings.container,
            settings.username,
            settings.region,
            settings.apiKey,
            logger
        );
    }
}
