'use strict';
require('reflect-metadata');
exports.WaitOnMetaKey = Symbol("PluginWaitOn");
function WaitOn(event) {
    return function (target, propertyKey, descriptor) {
        let existing = Reflect.getOwnMetadata(exports.WaitOnMetaKey, target, propertyKey) || [];
        existing.push(event);
        Reflect.defineMetadata(exports.WaitOnMetaKey, existing, target, propertyKey);
    };
}
exports.WaitOn = WaitOn;
