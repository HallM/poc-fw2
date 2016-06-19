/// <reference path="_all.d.ts" />


'use strict';

import { PluginManager } from '../plugin-system/';
import { ServiceManager } from '../service-manager/';

import * as fs from 'fs';
import * as path from 'path';

// TODO: may need to make Framework a singleton as well
export const serviceManager: ServiceManager = new ServiceManager();

export default class Framework {
    pluginManager: PluginManager

    constructor() {
        this.pluginManager = new PluginManager();

        this.discoverPlugins(__dirname + path.sep + 'plugins');
    }

    discoverPlugins(directory: string) {
        var files = fs.readdirSync(directory);

        files.forEach((file) => {
            var filepath = directory + path.sep + file;

            const PluginClass = require(filepath).default;
            this.pluginManager.addPlugin(PluginClass);
        });
    }

    start() {
        this.pluginManager.determineOrder();
        this.pluginManager.loadAll().then(() => {
            console.log('all running');
        });
    }
}
