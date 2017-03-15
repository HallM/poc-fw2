'use strict';

import 'reflect-metadata';

export const ReqParamMetaKey = Symbol("GetReqParam");

function GetParam(type: string, name: string) {
    return function(target: any, propertyKey: string) {
        let existing: any[] = Reflect.getOwnMetadata(ReqParamMetaKey, target, propertyKey) || [];
        existing.push({type: type, name: name});
        Reflect.defineMetadata(ReqParamMetaKey, existing, target, propertyKey);
    }
}

export function Query(name: string) {
    return GetParam('query', name);
}

export function Body(name: string) {
    return GetParam('body', name);
}

export function Header(name: string) {
    return GetParam('header', name);
}

export function Param(name: string) {
    return GetParam('params', name);
}
