'use strict';

import 'reflect-metadata';

export const ReturnsServiceMetaKey = Symbol("PluginReturnsService");

export function ReturnsService(serviceName: string | string[]) {
    const serviceNames = Array.isArray(serviceName) ? serviceName : [serviceName];

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(ReturnsServiceMetaKey, target, propertyKey) || [];
        Reflect.defineMetadata(ReturnsServiceMetaKey, serviceNames.concat(existing), target, propertyKey);
    };
}
