/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, Provides } from '../../../system-manager/';

import * as nconf from 'nconf';

@Plugin
export default class Config {
    @InitPhase
    @Provides('config')
    load() {
        nconf
          .argv()
          .env()
          .file({ file: 'config/config.json' })
          .file({ file: 'config/local.json' });

        return nconf;
    }
}
