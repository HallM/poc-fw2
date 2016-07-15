'use strict';

import 'reflect-metadata';

export const InitPhaseMetaKey = Symbol("PluginInitPhase");

export function InitPhase(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let existing: string[] = Reflect.getOwnMetadata(InitPhaseMetaKey, target) || [];
    existing.push(propertyKey);
    Reflect.defineMetadata(InitPhaseMetaKey, existing, target);
}
