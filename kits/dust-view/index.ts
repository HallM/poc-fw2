/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, InitPhase, After, Before } from '../../system-manager/';
import { Inject, ReturnsService } from '../../system-manager/'

import * as path from 'path';
import * as express from 'express';

import * as cons from 'consolidate';

export default class DustView {
    @InitPhase
    @Inject(['logger', 'config', 'express'])
    @Before('ExpressCompression:load')
    load(logger, config, app) {
        logger.debug('load view engine');

        config.defaults({
            expressDust: {
                viewDirectory: 'views'
            }
        });

        app.engine('dust', cons.dust);
        app.set('view engine', 'dust');
        app.set('views', config.get('expressDust:viewDirectory'));

        // pre-initialize the dust renderer. necessary because it's possible we send an email before someone loads a page
        cons.dust.render('notatemplate', {
            ext: app.get('view engine'),
            views: path.resolve(process.cwd(), app.get('views'))
        }, function() { /* we don't care about the return, it's an error anyway. but Dust is ready now */ });
    }
}
