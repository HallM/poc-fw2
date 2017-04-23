'use strict';

import 'reflect-metadata';

export const OnEventMetaKey = Symbol("SystemOnEvent");

export function On(event: string) {
    return function(target: any, propertyKey: string) {
        let servicesToInject: any = Reflect.getOwnMetadata(OnEventMetaKey, target) || {};
        servicesToInject[propertyKey] = event;
        Reflect.defineMetadata(OnEventMetaKey, servicesToInject, target);
    }
}
