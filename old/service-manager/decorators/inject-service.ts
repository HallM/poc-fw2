'use strict';

import 'reflect-metadata';

export const InjectServiceMetaKey = Symbol("SMInjectService");

export function InjectService(name: string) {
    // return Reflect.metadata(InjectServiceMetaKey, name);
    return function(target: any, propertyKey: string) {
        let servicesToInject: any = Reflect.getOwnMetadata(InjectServiceMetaKey, target) || {};
        servicesToInject[propertyKey] = name;
        Reflect.defineMetadata(InjectServiceMetaKey, servicesToInject, target);
    }
}
