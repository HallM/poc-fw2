/// <reference path="../framework/_all.d.ts" />
import 'reflect-metadata';
export { Plugin } from './decorators/plugin';
export { InitPhase } from './decorators/init-phase';
export { After } from './decorators/after';
export { Before } from './decorators/before';
export { On } from './decorators/on';
export { Inject } from './decorators/inject';
export { GetProvider } from './decorators/get-provider';
export { Provides } from './decorators/provides';

export declare class ServiceContext {
    private context;
    constructor(startingContext?: ServiceContext);
    exposeService(name: string, service: any): void;
    getService(name: string): any;
}
export declare class BatchLoader {
    linkDependentToDependency(dependent: string, dependency: string, required: boolean);
    addPlugin(PluginClass: any): Promise<any>;
}
export declare const PluginManager: {
    batchLoad: (callback: (BatchLoader) => void) => Promise<any>;
    addPlugin: (PluginClass: any) => Promise<any>;
    exposeService: (name: string, service: any) => void;
    getService: (name: string) => any;
    generateScope: () => any;
    injectInto: (obj: any, scope?: ServiceContext) => void;
    on: (event: string, listener: Function) => () => void;
    trigger: (event: string, evt?: any) => void;
};
