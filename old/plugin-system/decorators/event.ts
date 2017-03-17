'use strict';

import 'reflect-metadata';

export const EventMetaKey = Symbol("PluginEvent");

export function Event(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let existing: string[] = Reflect.getOwnMetadata(EventMetaKey, target) || [];
    existing.push(propertyKey);
    Reflect.defineMetadata(EventMetaKey, existing, target);
}
