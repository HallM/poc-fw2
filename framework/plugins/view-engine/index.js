/// <reference path="../../_all.d.ts" />
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const _1 = require('../../../plugin-system/');
const path = require('path');
var consolidate = require('consolidate');
var dustfork = require('../../../dust-fork');
class ViewEngine {
    load(app) {
        console.log('load view engine');
        dustfork.resolveImpl = function (elem) {
            return require(path.resolve('server', elem));
        };
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
            }, function () { });
        }
        catch (e) {
        }
    }
}
__decorate([
    _1.Event,
    _1.WaitOn('express:load'),
    _1.Block('express-compression:load')
], ViewEngine.prototype, "load", null);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ViewEngine;
