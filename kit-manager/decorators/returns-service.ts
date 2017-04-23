'use strict';

import 'reflect-metadata';
import { KitManager } from '../';

export const ReturnsServiceMetaKey = Symbol("PluginReturnsService");

export function ReturnsService(serviceName: string | string[]) {
    const serviceNames = Array.isArray(serviceName) ? serviceName : [serviceName];

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // using metadata to track for Before/After-like behavior
        let existing: any[] = Reflect.getOwnMetadata(ReturnsServiceMetaKey, target, propertyKey) || [];
        Reflect.defineMetadata(ReturnsServiceMetaKey, serviceNames.concat(existing), target, propertyKey);

        // wrap the function, so that we can get the returned value(s)
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }
        var originalFn = descriptor.value;
        descriptor.value = function (...args) {
            var services = originalFn.apply(null, args);
            // if there is nothing, do nothing. remember, null is not nothing!
            if (services === undefined) {
                return services;
            }

            // if it's a Promise, then we assume we need to run it first
            if (typeof services.then === 'function') {
                // return the promise so it can be waited on
                // and in return, that promise will yield services not exposed
                return services.then((promisedServices) => {
                    return exposeServices(serviceNames, promisedServices);
                });
            } else {
                // this will return the remaining services
                return exposeServices(serviceNames, services);
            }
        };
        return descriptor;
    };
}

function exposeServices(serviceNames: string[], services: any | any[]) {
    // if it is not an array returned, then it's a single export
    if (!Array.isArray(services)) {
        KitManager.exposeService(serviceNames[0], services);

        // no services left to return
        return null;
    } else {
        // make sure if the return is less or if the exporting is less, we don't go boom
        // all other exports are ignored/left undefined for leftovers/not-enough
        var index = Math.min(serviceNames.length, services.length);
        for (var i = 0; i < index; i++) {
            KitManager.exposeService(serviceNames[i], services[i]);
        }

        // return the remaining services
        return services.slice(index);
    }
}
