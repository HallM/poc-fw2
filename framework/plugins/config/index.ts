/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

import * as nconf from 'nconf';

@Plugin
export default class Config {
    @InitPhase
    load() {
        nconf
          .argv()
          .env()
          .file({ file: 'config/config.json' })
          .file({ file: 'config/local.json' });

        PluginManager.exposeService('config', nconf);
    }
}
