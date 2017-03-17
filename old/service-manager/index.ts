/// <reference path="../framework/_all.d.ts" />

'use strict';

import { InjectServiceMetaKey } from './decorators/inject-service';

export * from './decorators/inject-service';

export class ServiceContext {
    private context: any

    constructor(startingContext: ServiceContext) {
        this.context = startingContext ? Object.assign({}, startingContext.context) : {};
    }

    addService(name: string, service: any) {
        this.context[name] = service;
    }

    getService(name: string): any {
        return this.context[name];
    }
}

export class ServiceManager {
    private globalContext: ServiceContext

    constructor() {
        this.globalContext = new ServiceContext(null);
    }

    addService(name: string, service: any) {
        this.globalContext.addService(name, service);
    }

    getService(name: string): any {
        return this.globalContext.getService(name);
    }

    makeRequestContext(): ServiceContext {
        return new ServiceContext(this.globalContext);
    }
}
