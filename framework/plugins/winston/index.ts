/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

var winston = require('winston');

@Plugin
export default class Winston {
    @InitPhase
    load() {
        console.log('load Winston');

        winston.level = nconf.get('logLevel');
        PluginManager.exposeService('logger', winston);
    }
}
