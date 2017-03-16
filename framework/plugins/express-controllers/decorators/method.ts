'use strict';

import 'reflect-metadata';

export const MethodMetaKey = Symbol("MethodKey");

export function Method(method: string) {
    const lowerCaseMethod = method.toLowerCase();
    return function(target: any, propertyKey: string) {
        Reflect.defineMetadata(MethodMetaKey, lowerCaseMethod, target, propertyKey);
    };
}
