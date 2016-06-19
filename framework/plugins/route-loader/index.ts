/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';
import { serviceManager } from '../../';
import { InjectServiceMetaKey } from '../../../service-manager/';

import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';

var dust = require('../../../dust-fork');

// TODO: config paths
var viewPages = path.resolve('views/pages/');
var serverPages = path.resolve('server/pages/');
var serverComponents = path.resolve('server/components/');
var extension = '.dust';

function makeServiceContext(req, res) {
    const svc = serviceManager.makeRequestContext();
    svc.addService('req', req);
    svc.addService('res', res);
    return svc;
}

function makeContext(svc) {
    //: {req: express.Request, res: express.Request, svc: ServiceContext}
    // const ctx = {req: req, res: res, svc: svc};
    let localstack = dust.makeBase({});
    localstack = localstack.push(svc);

    return localstack;
}

// TODO: experimenting with lazy-loading, but specifically for dev time only
// TODO: figure out how to handle errors during page loading
function wrapPage(page: string) {
    return function(req: express.Request, res: express.Response, next: express.NextFunction) {
        const svc = makeServiceContext(req, res);
        let localstack = makeContext(svc);

        try {
            const ImplClass = require(path.resolve('server', page));
            const data = new ImplClass();

            const servicesToInject: any = Reflect.getOwnMetadata(InjectServiceMetaKey, data) || {};
            for (let prop in servicesToInject) {
                data[prop] = svc.getService(servicesToInject[prop]);
            }

            localstack = localstack.push(data);
        } catch(e) {
        }
        dust.stream(page, localstack).pipe(res);
    };
}

function wrapDynamic(page: string, ImplClass: any) {
    return function(req: express.Request, res: express.Response) {
        const svc = makeServiceContext(req, res);
        let localstack = makeContext(svc);

        const data = new ImplClass();
        const servicesToInject: any = Reflect.getMetadata(InjectServiceMetaKey, data) || {};
        for (let prop in servicesToInject) {
            data[prop] = svc.getService(servicesToInject[prop]);
        }

        localstack = localstack.push(data);

        dust.stream(page, localstack).pipe(res);
    };
}

function wrapStatic(page: string) {
    return function(req: express.Request, res: express.Response) {
        const svc = makeServiceContext(req, res);
        let localstack = makeContext(svc);
        dust.stream(page, localstack).pipe(res);
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
        var jsfullpath = serverPages + path.sep + jsfile;
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
            this.router.get(guessedUrl, wrapStatic('pages/' + filepath));
        } else {
            var ImplClass = require(path.resolve('server', 'pages', fileNoExt));
            const url = ImplClass.pageUrl || guessedUrl;

            console.log('dynamic page', filepath, url);
            this.router.get(url, wrapDynamic('pages/' + filepath, ImplClass));
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
        this.scanDirectory('', viewPages, this.createPageRoutes);

        // scan component implementations to add action routes
        // scanDirectory('', serverComponents, loadComponentAndCreateRoutes);

        app.use(this.router);
    }
}
