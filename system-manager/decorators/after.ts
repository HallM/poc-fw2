'use strict';

import 'reflect-metadata';

export const AfterMetaKey = Symbol("PluginPhaseAfter");

export function After(event: string | string[], required: boolean = true) {
    const events = Array.isArray(event) ? event : [event];

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(AfterMetaKey, target, propertyKey) || [];
        const newEvents = events.map((evt) => {
            return {
                event: evt,
                required: required
            };
        });

        Reflect.defineMetadata(AfterMetaKey, existing.concat(newEvents), target, propertyKey);
    };
}
