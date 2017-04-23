/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import RackspaceService from './rackspace-service';

export default class Logger {
    @InitPhase
    @ReturnsService('rackspace')
    @Inject(['logger', 'config'])
    load(logger, config) {
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
