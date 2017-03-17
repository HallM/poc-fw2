/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Provides, GetProvider } from '../../../system-manager/';

import EmailService from './email-service';

@Plugin
export default class Logger {
    @InitPhase
    @GetProvider('config')
    @GetProvider('logger')
    @Provides('email')
    load(config, logger) {
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
            settings.configDirectory,
            settings.viewsDirectory,
            settings.mailgunDomain,
            settings.mailgunApiKey,
            settings.siteAddress,
            settings.defaultFrom,
            logger
        );
    }
}
