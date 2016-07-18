'use strict';

import 'reflect-metadata';

export const ReqParamMetaKey = Symbol("GetReqParam");

function GetParam(type: string, name: string) {
    return function(target: any, propertyKey: string) {
        let servicesToInject: any = Reflect.getOwnMetadata(ReqParamMetaKey, target) || {};
        servicesToInject[propertyKey] = {type: type, name: name};
        Reflect.defineMetadata(ReqParamMetaKey, servicesToInject, target);
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
