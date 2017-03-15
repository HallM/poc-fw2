/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

const nconf = require('nconf');

@Plugin
export default class Config {
    @InitPhase
    load() {
        console.log('load config');

        nconf
          .argv()
          .env()
          .file({ file: 'config/config.json' })
          .file({ file: 'config/local.json' });

        PluginManager.exposeService('config', nconf);
    }
}
