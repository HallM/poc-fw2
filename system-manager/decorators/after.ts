'use strict';

import 'reflect-metadata';

export const AfterMetaKey = Symbol("PluginPhaseAfter");

export function After(event: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: string[] = Reflect.getOwnMetadata(AfterMetaKey, target, propertyKey) || [];
        existing.push(event);
        Reflect.defineMetadata(AfterMetaKey, existing, target, propertyKey);
    };
}
