'use strict';

import 'reflect-metadata';
import { KitManager } from '../';

export const InjectServiceMetaKey = Symbol("SMInjectService");

export function Inject(serviceName: string | string[], required: boolean = true) {
    const serviceNames = Array.isArray(serviceName) ? serviceName : [serviceName];

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // define the metadata on the property for functions
        // otherwise, for variables, all functions will need to wait for availability
        const metadataProperty = typeof target[propertyKey] === 'function' ? propertyKey : undefined;

        let existing: any[] = Reflect.getOwnMetadata(InjectServiceMetaKey, target, metadataProperty) || [];

        const newServices = serviceNames.map((name) => {
            return {
                providerName: name,
                required: required
            };
        });

        Reflect.defineMetadata(InjectServiceMetaKey, newServices.concat(existing), target, metadataProperty);

        // wrap the function or property in a way that injects the service as needed
        // if it's a function, then wrap it with service fetcher
        if (typeof target[propertyKey] === 'function') {
            if (descriptor === undefined) {
                descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            }
            var originalFn = descriptor.value;
            descriptor.value = function (...args) {
                var services = serviceNames.map((name) => {
                    return KitManager.getService(name);
                });
                return originalFn.apply(null, args.concat(services));
            };
            return descriptor;
        }

        // otherwise, is a property, and we just inject it with a readonly getter
        // should only be a single serviceName here though
        if (Array.isArray(serviceName)) {
            throw new Error('Can only inject a single service into a property');
        }

        return Object.defineProperty(target, propertyKey, {
            get: function () {
                return KitManager.getService(serviceName);
            },
            enumerable: true,
            configurable: true
        });
    };
}
