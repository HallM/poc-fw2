'use strict';

import 'reflect-metadata';

export const BeforeMetaKey = Symbol("PluginPhaseBefore");

export function Before(event: string, required: boolean = true) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(BeforeMetaKey, target, propertyKey) || [];
        existing.push({
            event: event,
            required: required
        });
        Reflect.defineMetadata(BeforeMetaKey, existing, target, propertyKey);
    };
}
