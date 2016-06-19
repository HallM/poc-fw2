'use strict';

import 'reflect-metadata';

export const ReqParamMetaKey = Symbol("GetReqParam");

function GetParam(type: string, name: string) {
    return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        let existing: any[] = Reflect.getOwnMetadata(ReqParamMetaKey, target, propertyKey) || [];
        existing.splice(0, 0, {type: type, name: name});
        Reflect.defineMetadata(ReqParamMetaKey, existing, target, propertyKey);
    };
}

export function QueryParam(name: string) {
    return GetParam('query', name);
}

export function BodyParam(name: string) {
    return GetParam('body', name);
}
