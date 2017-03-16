'use strict';

import 'reflect-metadata';

export const GetProviderMetaKey = Symbol("PluginGetProvider");

export function GetProvider(providerName: string, required: boolean = true) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(GetProviderMetaKey, target, propertyKey) || [];
        existing.splice(0, 0, {
            providerName: providerName,
            required: required
        });
        Reflect.defineMetadata(GetProviderMetaKey, existing, target, propertyKey);
    };
}
