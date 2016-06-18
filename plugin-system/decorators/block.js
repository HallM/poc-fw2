'use strict';
require('reflect-metadata');
exports.BlockMetaKey = Symbol("PluginBlock");
function Block(event) {
    return function (target, propertyKey, descriptor) {
        let existing = Reflect.getOwnMetadata(exports.BlockMetaKey, target, propertyKey) || [];
        existing.push(event);
        Reflect.defineMetadata(exports.BlockMetaKey, existing, target, propertyKey);
    };
}
exports.Block = Block;
