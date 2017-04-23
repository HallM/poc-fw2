/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import EmailService from './email-service';

export default class Logger {
    @InitPhase
    @ReturnsService('email')
    @Inject(['logger', 'config'])
    load(logger, config) {
        // TODO: no default, just leaving here for the day I have schemas
        config.required([
            'email:configDirectory',
            'email:viewsDirectory',
            'email:mailgunDomain',
            'email:mailgunApiKey',
            'email:siteAddress',
            'email:defaultFrom'
        ]);

        const settings = config.get('email');

        return new EmailService(
            logger,
            settings
        );
    }
}
