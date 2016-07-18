/// <reference path="_all.d.ts" />

'use strict';

import { PluginManager } from '../system-manager/';
export { PluginManager } from '../system-manager/';

import * as fs from 'fs';
import * as path from 'path';

// this is really just a bundle of things

function discoverPlugins(directory: string) {
    var files = fs.readdirSync(directory);

    files.forEach((file) => {
        var filepath = directory + path.sep + file;
        require(filepath);
    });
}

PluginManager.batchLoad(() => {
    discoverPlugins(__dirname + path.sep + 'plugins');
});
