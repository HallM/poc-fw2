/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, Inject } from '../../../system-manager/';

const mongoose = require('mongoose');
const fs = require('fs');

@Plugin
export default class Mongoose {
    @InitPhase
    @After('Config:load')
    load() {
        const config = PluginManager.getService('config');

        let options = {
            autoindex: process.env.NODE_ENV !== 'production',
            server: undefined
        };

        const sslCertLocation = config.get('mongo.sslFile');
        if (sslCertLocation) {
            options.server = {
                sslCert: fs.readFileSync('./mongo.cert')
            };
        }

        const connectString = config.get('mongo.connectString');

        if (!connectString) {
            return Promise.reject('Missing config for mongo.connectString');
        }

        return mongoose.connect(connectString, options);
    }
}
