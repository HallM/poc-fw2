'use strict';

import 'reflect-metadata';

export const BeforeMetaKey = Symbol("PluginPhaseBefore");

export function Before(event: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: string[] = Reflect.getOwnMetadata(BeforeMetaKey, target, propertyKey) || [];
        existing.push(event);
        Reflect.defineMetadata(BeforeMetaKey, existing, target, propertyKey);
    };
}
