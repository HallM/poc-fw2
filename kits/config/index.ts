/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as nconf from 'nconf';

export default class Config {
    @InitPhase
    @ReturnsService('config')
    load() {
        nconf
          .argv()
          .env()
          .file({ file: 'config/config.json' })
          .file({ file: 'config/local.json' });

        return nconf;
    }
}
