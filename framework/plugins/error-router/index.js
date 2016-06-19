/// <reference path="../../_all.d.ts" />
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const _1 = require('../../../plugin-system/');
const notfound_1 = require('../../errors/notfound');
class ErrorRouter {
    load(app) {
        console.log('load error routes');
        // set up our general 404 error handler
        app.use(function (req, res, next) {
            // pass it down to the general error handler
            next(new notfound_1.NotFoundError('404 error occurred while attempting to load ' + req.url));
        });
        // the catch all and, general error handler. use next(err) to send it through this
        app.use(require(__dirname + '/error-handler'));
    }
}
__decorate([
    _1.Event,
    _1.WaitOn('express:load'),
    _1.Block('express:run')
], ErrorRouter.prototype, "load", null);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorRouter;
