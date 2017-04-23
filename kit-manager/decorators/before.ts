'use strict';

import 'reflect-metadata';

export const BeforeMetaKey = Symbol("PluginPhaseBefore");

export function Before(event: string | string[], required: boolean = true) {
    const events = Array.isArray(event) ? event : [event];

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let existing: any[] = Reflect.getOwnMetadata(BeforeMetaKey, target, propertyKey) || [];

        const newEvents = events.map((evt) => {
            return {
                event: evt,
                required: required
            };
        });

        Reflect.defineMetadata(BeforeMetaKey, existing.concat(newEvents), target, propertyKey);
    };
}
