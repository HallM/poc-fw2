/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import * as path from 'path';

var consolidate = require('consolidate');
var dustfork = require('../../../dust-fork');

export default class ViewEngine {
    @Event
    @WaitOn('express:load')
    @Block('express-compression:load')
    load(app) {
        console.log('load view engine');
        dustfork.resolveImpl = function(elem) {
            return require(path.resolve('server', elem));
        }

        consolidate.requires.dust = dustfork;

        const ext = 'dust';
        const viewDir = 'views';

        app.engine('dust', consolidate.dust);
        app.set('view engine', ext);
        app.set('views', viewDir);
        // just pre-loading dustjs
        try {
            consolidate.dust.render('index', {
                ext: ext,
                views: viewDir,
                cache: false
            }, function() {});
        } catch(e) {
        }
    }
}
