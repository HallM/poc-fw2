'use strict';

import 'reflect-metadata';

import { PluginManager } from '../';
import { InjectServiceMetaKey } from './inject';

export function Plugin(name: string) {
    return function(target: any) {
        var original = target;

        function construct(constructor, args) {
            var c : any = function () {
                return constructor.apply(this, args);
            };

            c.prototype = constructor.prototype;
            return new c();
        }

        var f : any = function (...args) {
            return construct(original, args);
        }
        f.pluginName = name;

        f.prototype = original.prototype;
        f.prototype.exposeService = PluginManager.exposeService;
        f.prototype.getService = PluginManager.getService;
        f.prototype.on = PluginManager.on;
        f.prototype.trigger = PluginManager.trigger;

        PluginManager.addPlugin(f);

        return f;
    };
}
