'use strict';

import 'reflect-metadata';

export const InjectServiceMetaKey = Symbol("SMInjectService");

// export function Inject(name: string) {
//     return function(target: any, propertyKey: string) {
//         let servicesToInject: any = Reflect.getOwnMetadata(InjectServiceMetaKey, target) || {};
//         servicesToInject[propertyKey] = name;
//         Reflect.defineMetadata(InjectServiceMetaKey, servicesToInject, target);
//     }
// }

export function Inject(serviceName: string | string[], required: boolean = true) {
    const serviceNames = Array.isArray(serviceName) ? serviceName : [serviceName];

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(InjectServiceMetaKey, target, propertyKey) || [];

        const newServices = serviceNames.map((name) => {
            return {
                providerName: name,
                required: required
            };
        });

        Reflect.defineMetadata(InjectServiceMetaKey, newServices.concat(existing), target, propertyKey);
    };
}
