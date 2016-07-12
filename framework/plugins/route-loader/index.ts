/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import { serviceManager } from '../../';
import { InjectServiceMetaKey } from '../../../service-manager/';

import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';

// TODO: config paths
var pagesDir = path.resolve('pages/');
var extension = '.ltml';

// TODO: experimenting with lazy-loading, but specifically for dev time only
// TODO: figure out how to handle errors during page loading
function wrapPage(page: string) {
    return function(req: express.Request, res: any, next: express.NextFunction) {
        res.render(page);
    };
}

function determineUrl(filepath: string) {
    var possibleUrl = filepath.replace(path.sep, '/');
    var parts = possibleUrl.split('/');
    var totalParts = parts.length;
    var lastpart = parts[totalParts-1].toLowerCase();

    if (lastpart === 'index') {
        // we remove the last part and use that
        parts.pop();
        return parts.join('/');
    }

    if (totalParts < 2) {
        return possibleUrl;
    }

    var nextlastpart = parts[totalParts-2].toLowerCase();

    var checkRepetition = lastpart.indexOf(nextlastpart);

    // no need to check for -1 index, the math solves that
    if (checkRepetition + nextlastpart.length === lastpart.length) {
        // then we remove the last bit, helps prevent repetition like user/createuser
        parts[totalParts-1] = parts[totalParts-1].substring(0, checkRepetition);
        return parts.join('/');
    }

    // then keep as is
    return possibleUrl;
}

// function createActionRoutes(component) {
// }

// function loadComponentAndCreateRoutes(filepath, filefullpath) {
// }

export default class RouteLoader {
    static pluginName: string = 'route-loader'

    private router: express.Router

    private createPageRoutes(filepath: string, filefullpath: string) {
        var extensionIndex = filepath.indexOf(extension);

        // make sure it ends in the extension we expect
        if (extensionIndex === -1 || extensionIndex + extension.length !== filepath.length) {
            // ignores things like strings file
            return;
        }

        var fileNoExt = filepath.substring(0, extensionIndex);

        var jsfile = fileNoExt + '.js';
        var jsfullpath = pagesDir + path.sep + jsfile;
        const guessedUrl = '/' + determineUrl(fileNoExt);

        // check if a js file exists
        var jsfstats = null;
        try {
            jsfstats = fs.lstatSync(jsfullpath);
        } catch(e) {
            // TODO: probably simple just doesnt exist
            // but could some other event cause this we should notify the user?
            jsfstats = null;
        }

        if (!jsfstats || !jsfstats.isFile()) {
            console.log('static page', filepath, guessedUrl);
            this.router.get(guessedUrl, wrapPage('pages/' + fileNoExt));
        } else {
            var ImplClass = require(path.resolve(pagesDir, fileNoExt));
            const url = ImplClass.pageUrl || guessedUrl;

            console.log('dynamic page', filepath, url);
            this.router.get(url, wrapPage('pages/' + fileNoExt));
        }
        // console.log('create page', filepath, url);
        // this.router.get(url, wrapPage('pages/' + fileNoExt));
    }

    private scanDirectory(dir: string, basedir: string, fn: Function) {
        var dirfullpath = path.resolve(basedir, dir);
        var files = fs.readdirSync(dirfullpath);

        var directories = [];

        files.forEach((file) => {
            var filepath = dir + file;
            var filefullpath = basedir + path.sep + filepath;
            var fstats = fs.lstatSync(filefullpath);

            if (fstats.isDirectory()) {
                directories.push(filepath);
                return;
            }
            if (!fstats.isFile()) {
                // TODO: not sure if we should let people know
                return;
            }

            fn.call(this, filepath, filefullpath);
        });

        directories.forEach((directory) => {
            this.scanDirectory(directory + path.sep, basedir, fn);
        });
    }

    @Event
    @WaitOn('express:load')
    @WaitOn('body-parser:load')
    @WaitOn('http-sessions:load')
    @Block('error-router:load')
    @Block('express:run')
    load(app) {
        console.log('find and load page routes');

        this.router = express.Router();

        // TODO: dont crash when these directories dont exist
        // scan for pages based on views (a page must have a view)
        this.scanDirectory('', pagesDir, this.createPageRoutes);

        // scan component implementations to add action routes
        // scanDirectory('', serverComponents, loadComponentAndCreateRoutes);

        app.use(this.router);
    }
}
