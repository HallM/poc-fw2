'use strict';

import 'reflect-metadata';

export const ProvidesMetaKey = Symbol("PluginProvides");

export function Provides(providerName: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(ProvidesMetaKey, target, propertyKey) || [];
        existing.splice(0, 0, providerName);
        Reflect.defineMetadata(ProvidesMetaKey, existing, target, propertyKey);
    };
}
