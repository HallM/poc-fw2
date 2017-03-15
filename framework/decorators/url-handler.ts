'use strict';

import 'reflect-metadata';

export const UrlHandlerMetaKey = Symbol("UrlHandlerKey");

export function UrlHandler(url: string) {
    return function(target: any, propertyKey: string) {
        Reflect.defineMetadata(UrlHandlerMetaKey, url, target, propertyKey);
    }
}
