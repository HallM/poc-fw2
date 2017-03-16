'use strict';

import 'reflect-metadata';

export const WaitOnMetaKey = Symbol("PluginWaitOn");

export function WaitOn(event: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: string[] = Reflect.getOwnMetadata(WaitOnMetaKey, target, propertyKey) || [];
        existing.push(event);
        Reflect.defineMetadata(WaitOnMetaKey, existing, target, propertyKey);
    };
}
