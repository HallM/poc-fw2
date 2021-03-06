/// <reference path="../../_all.d.ts" />

'use strict';

import { KitManager, InitPhase, After, Before } from '../../kit-manager/';
import { Inject, ReturnsService } from '../../kit-manager/'

import * as nconf from 'nconf';

export default class NconfKit {
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
