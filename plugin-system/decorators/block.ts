'use strict';

import 'reflect-metadata';

export const BlockMetaKey = Symbol("PluginBlock");

export function Block(event: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: string[] = Reflect.getOwnMetadata(BlockMetaKey, target, propertyKey) || [];
        existing.push(event);
        Reflect.defineMetadata(BlockMetaKey, existing, target, propertyKey);
    };
}
