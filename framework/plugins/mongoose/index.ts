/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

var mongoose = require('mongoose');

@Plugin
export default class Mongoose {
    @InitPhase
    load() {
        return new Promise((resolve, reject) => {
            console.log('load mongoose');
            mongoose.connect('', {}, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
