/// <reference path="../../_all.d.ts" />

'use strict';

import { PluginManager, Plugin, InitPhase, After, Before, GetProvider } from '../../../system-manager/';

import mongoose from 'mongoose';
import * as fs from 'fs';

@Plugin
export default class Mongoose {
    @InitPhase
    @GetProvider('config')
    @GetProvider('logger')
    load(config, logger) {
        logger.debug('load mongoose');

        let options = {
            autoindex: process.env.NODE_ENV !== 'production',
            server: undefined
        };

        const sslCertLocation = config.get('mongo:sslFile');
        if (sslCertLocation) {
            options.server = {
                sslCert: fs.readFileSync('./mongo.cert')
            };
        }

        const connectString = config.get('mongo:connectString');

        if (!connectString) {
            return Promise.reject('Missing config for mongo.connectString');
        }

        return mongoose.connect(connectString, options);
    }
}
