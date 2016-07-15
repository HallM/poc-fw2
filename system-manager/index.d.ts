/// <reference path="../framework/_all.d.ts" />
import 'reflect-metadata';
export { Plugin } from './decorators/plugin';
export { InitPhase } from './decorators/init-phase';
export { After } from './decorators/after';
export { Before } from './decorators/before';
export { Inject } from './decorators/inject';
export declare const PluginManager: {
    batchLoad(callback: Function): void;
    addPlugin(PluginClass: any): void;
    exposeService(name: string, service: any): void;
    getService(name: string): any;
    on(event: string, listener: Function): () => void;
    trigger(event: string, evt: any): void;
};
