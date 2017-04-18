'use strict';

import 'reflect-metadata';

export const MiddlewareMetaKey = Symbol("MiddlewareInject");

import * as express from 'express';

export function Middleware(middleware: express.Handler) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(MiddlewareMetaKey, target, propertyKey) || [];
        existing.splice(0, 0, middleware);
        Reflect.defineMetadata(MiddlewareMetaKey, existing, target, propertyKey);
    };
}
