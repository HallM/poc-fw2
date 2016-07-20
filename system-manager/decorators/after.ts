'use strict';

import 'reflect-metadata';

export const AfterMetaKey = Symbol("PluginPhaseAfter");

export function After(event: string, required: boolean = true) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(AfterMetaKey, target, propertyKey) || [];
        existing.push({
            event: event,
            required: required
        });
        Reflect.defineMetadata(AfterMetaKey, existing, target, propertyKey);
    };
}
