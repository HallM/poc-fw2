/// <reference path="../_all.d.ts" />

/*
  api for plugin-system

  addPlugin(string, any)
  determineOrder()
  loadAll()

  3 phases:
  - discovery phase (only one that can add plugins, cannot call loadAll)
    - needs the graph of events
  - ordered phase (can only call loadAll from here)
    - needs the exec stack of events
  - loaded (can not do anything now)

*/

import 'reflect-metadata';

import { PhaseGraphNode } from './phase-graph-node';

import { InitPhaseMetaKey } from './decorators/init-phase';
import { AfterMetaKey } from './decorators/after';
import { BeforeMetaKey } from './decorators/before';
import { OnEventMetaKey } from './decorators/on';
import { InjectServiceMetaKey } from './decorators/inject';
import { ReturnsServiceMetaKey } from './decorators/returns-service';
// import { GetProviderMetaKey } from './decorators/get-provider';

export { InitPhase } from './decorators/init-phase';
export { After } from './decorators/after';
export { Before } from './decorators/before';
export { On } from './decorators/on';
export { Inject } from './decorators/inject';
export { ReturnsService } from './decorators/returns-service';
// export { GetProvider } from './decorators/get-provider';

function loadAsyncGroup(execNodes: PhaseGraphNode[]): Promise<any> {
  let p = Promise.resolve();
  const count = execNodes.length;

  return Promise.all(execNodes.map((node) => {
    const args = node.wantsProviders().map(serviceName => getService(serviceName));
    return node.execute(args).then((result:any) => {
      const provides = node.providesServices();
      if (!provides.length) {
        return null;
      }

      if (!result) {
        throw new Error(`${node.toString()} did not provide the promised services: "${provides.join(', ')}"`);
      }

      if (provides.length === 1) {
        exposeService(provides[0], result);
        return result;
      } else if (Array.isArray(result) && result.length == provides.length) {
        provides.forEach((serviceName, index) => {
          exposeService(serviceName, result[index]);
        });
        return result;
      } else {
        const start = result && Array.isArray(result) ? result.length : 0;
        throw new Error(`${node.toString()} did not provide the promised services: "${provides.slice(start).join(', ')}"`);
      }
    });
  })).then(() => {
    completedPhases = completedPhases.concat(execNodes);
  });
}

class BatchLoader {
  private graphNodes: PhaseGraphNode[]
  finalPromise: Promise<any>

  private serviceToNodeMap: any

  private resolver: Function
  private rejecter: Function

  constructor() {
    this.graphNodes = [];
    this.serviceToNodeMap = {};

    this.finalPromise = new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
  }

  linkDependentToDependency(dependent: string, dependency: string, required: boolean = true) {
    const dependentNode: PhaseGraphNode = this.findOrCreateNode(dependent);
    const dependencyNode: PhaseGraphNode = this.findOrCreateNode(dependency);

    if (required) {
      dependentNode.addDependency(dependencyNode);
    } else {
      dependentNode.addWeakDependency(dependencyNode);
    }
    dependencyNode.addDependent(dependentNode);
  }

  addBatch(batch: BatchLoader): Promise<any> {
    // copy everything from the batch
    this.graphNodes = this.graphNodes.concat(batch.graphNodes);

    for (const serviceName in batch.serviceToNodeMap) {
      if (!this.serviceToNodeMap[serviceName]) {
        this.serviceToNodeMap[serviceName] = batch.serviceToNodeMap[serviceName];
      } else {
        const nodeProvided = this.serviceToNodeMap[serviceName].providesService;
        throw new Error(`${serviceName} was already provided by ${nodeProvided.toString()}`);
      }
    }

    // effectively copy the promise over in case someone relied on it
    this.finalPromise.then((...args) => {
      batch.resolver(...args);
    }).catch((...args) => {
      batch.rejecter(...args);
    });

    return this.finalPromise;
  }

  addPlugin(PluginClass: any): Promise<any> {
    if (!PluginClass) {
      throw new Error('Cannot add null or undefined as a plugin');
    }

    const name: string = PluginClass.name || PluginClass.pluginName;
    if (!name) {
      throw new Error('Cannot add a plugin without a pluginName');
    }

    // get all "events", aka functions and their names
    // the event name is {plugin name}:{fn name}
    const plugin: any = new PluginClass();
    // injectInto(plugin, null);

    const phases: string[] = Reflect.getMetadata(InitPhaseMetaKey, plugin) || [];

    phases.forEach(event => {
      const fn: Function = plugin[event];
      const waitsOn: any[] = Reflect.getMetadata(AfterMetaKey, plugin, event) || [];
      const blocks: any[] = Reflect.getMetadata(BeforeMetaKey, plugin, event) || [];

      const provides: any[] = Reflect.getMetadata(ReturnsServiceMetaKey, plugin, event) || [];
      const provided: any[] = Reflect.getMetadata(InjectServiceMetaKey, plugin, event) || [];

      const eventName: string = `${name}:${event}`;

      const node: PhaseGraphNode = this.findOrCreateNode(eventName);
      node.claimNode(plugin, fn);

      waitsOn.forEach(dep => {
        const depNode: PhaseGraphNode = this.findOrCreateNode(dep.event);

        if (dep.required) {
          node.addDependency(depNode);
        } else {
          node.addWeakDependency(depNode);
        }
        depNode.addDependent(node);
      });

      blocks.forEach(dep => {
        const depNode: PhaseGraphNode = this.findOrCreateNode(dep.event);

        if (dep.required) {
          node.addDependent(depNode);
        } else {
          node.addWeakDependent(depNode);
        }
        depNode.addDependency(node);
      });

      provides.forEach(serviceName => {
        if (!this.serviceToNodeMap[serviceName]) {
          this.serviceToNodeMap[serviceName] = {
            needsService: [],
            couldWantService: [],
            providesService: node
          };
        } else if (this.serviceToNodeMap[serviceName].providesService == null) {
          this.serviceToNodeMap[serviceName].providesService = node;
        } else {
          const nodeProvided = this.serviceToNodeMap[serviceName].providesService;
          throw new Error(`${serviceName} was already provided by ${nodeProvided.toString()}`);
        }

        node.addProvides(serviceName);
      });

      provided.forEach((serviceInfo) => {
        const serviceName = serviceInfo.providerName;
        const isRequired = serviceInfo.required;

        if (!this.serviceToNodeMap[serviceName]) {
          this.serviceToNodeMap[serviceName] = {
            needsService: isRequired ? [node] : [],
            couldWantService: isRequired ? [] : [node],
            providesService: null
          };
        } else {
          if (isRequired) {
            this.serviceToNodeMap[serviceName].needsService.push(node);
          } else {
            this.serviceToNodeMap[serviceName].couldWantService.push(node);
          }
        }

        node.addGetProvider(serviceName);
      });
    });

    return this.finalPromise;
  }

  loadAll(): Promise<any> {
    const execStack = this.determineOrder();

    let p = Promise.resolve();
    const groupCount = execStack.length;

    for (let i=0; i < groupCount; i++) {
      p = p.then(() => {
        return loadAsyncGroup(execStack[i]);
      });
    }

    p.then(() => {
      this.resolver(this.graphNodes);
    }).catch((e) => {
      this.rejecter(e);
    });

    return this.finalPromise;
  }

  private addBlocksForProviders() {
    const unprovidedServices = [];
    for (const serviceName in this.serviceToNodeMap) {
      const mapInfo = this.serviceToNodeMap[serviceName];

      if (mapInfo.providesService == null) {
        if (mapInfo.needsService.length) {
          unprovidedServices.push(serviceName);
        }
        continue;
      }

      const node: PhaseGraphNode = mapInfo.providesService;

      mapInfo.needsService.forEach((wantingNode: PhaseGraphNode) => {
        wantingNode.addDependency(node);
        node.addDependent(wantingNode);
      });

      mapInfo.couldWantService.forEach((wantingNode: PhaseGraphNode) => {
        wantingNode.addDependency(node);
        node.addDependent(wantingNode);
      });
    }

    if (unprovidedServices.length) {
      throw new Error(`The following services were not provided: ${unprovidedServices.join(', ')}`);
    }
  }

  private determineOrder(): PhaseGraphNode[][] {
    // be sure to add the blockers for GetProvider
    this.addBlocksForProviders();

    let nodes = this.graphNodes.filter(node => !node.isUnclaimed() || node.isRequired());
    this.checkForUnclaimed(nodes);

    let execStack: PhaseGraphNode[][] = [];
    let readyNodes: PhaseGraphNode[] = [];

    while (nodes.length) {
      const preLength = nodes.length;
      let foundNodes = nodes.filter(node => node.wouldBeReady(readyNodes, false));
      if (foundNodes.length === 0) {
        // next, try if any nodes were not required
        foundNodes = nodes.filter(node => node.wouldBeReady(readyNodes, true));
      }

      if (foundNodes.length === 0) {
        throw new Error('Cannot satisfy all dependencies. A circular dependency may exist.');
      }

      // remove the foundNodes from the list of graphNodes
      nodes = nodes.filter(node => foundNodes.indexOf(node) === -1);

      execStack.push(foundNodes);
      readyNodes = readyNodes.concat(foundNodes);
    }

    // execStack.reverse();
    return execStack;
  }

  private findOrCreateNode(eventName: string): PhaseGraphNode {
    let foundNode: PhaseGraphNode = this.graphNodes.find(node => node.isSelf(eventName));

    if (!foundNode) {
      foundNode = completedPhases.find(node => node.isSelf(eventName));
    }

    if (!foundNode) {
      const newNode = new PhaseGraphNode(eventName);
      this.graphNodes.push(newNode);
      return newNode;
    } else {
      return foundNode;
    }
  }

  private checkForUnclaimed(nodes: PhaseGraphNode[]) {
    const unclaimed: PhaseGraphNode[] = nodes.filter(node => node.isUnclaimed() && node.isRequired());

    if (unclaimed.length) {
      const missingNames: string = unclaimed.map(node => node.toString()).join(', ');
      throw new Error('The following plugins are missing: ' + missingNames);
    }
  }
}

export class ServiceContext {
    private context: any

    constructor(startingContext?: ServiceContext) {
        this.context = startingContext ? Object.assign({}, startingContext.context) : {};
    }

    exposeService(name: string, service: any) {
        this.context[name] = service;
    }

    getService(name: string): any {
        return this.context[name];
    }
}

let completedPhases: PhaseGraphNode[] = [];
const globalServiceContext = new ServiceContext();

const eventListeners: any = {};

function loadMultiple(callback: Function): BatchLoader {
  const loader = new BatchLoader();
  callback(loader);
  return loader;
}

function loadPlugin(PluginClass: any): Promise<any> {
  // using a "batch" because BatchLoader has the logic
  var loader = new BatchLoader();
  loader.addPlugin(PluginClass);
  return loader.loadAll();
}

function exposeService(name: string, service: any) {
  globalServiceContext.exposeService(name, service);
}

function getService(name: string): any {
  return globalServiceContext.getService(name);
}

function generateScope(): any {
  let svcScope = new ServiceContext(globalServiceContext);
  trigger('generate-scope', svcScope);
  return svcScope;
}

// function injectInto(obj: any, scope?: ServiceContext) {
//   const context = scope || globalServiceContext;
//   const onEvents: string[] = Reflect.getMetadata(OnEventMetaKey, obj) || {};
//   const injects: string[] = Reflect.getMetadata(InjectServiceMetaKey, obj) || {};

//   for (let prop in onEvents) {
//     on(onEvents[prop], obj[prop]);
//   }

//   for (let prop in injects) {
//     obj[prop] = context.getService(injects[prop]);
//   }
// }

function on(event: string, listener: Function) {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }

  const listeners: Function[] = eventListeners[event];
  if (listeners.indexOf(listener) === -1) {
    listeners.push(listener);
  }

  // give the caller back a way to unsubscribe
  return () => {
    const listeners: Function[] = eventListeners[event];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

function trigger(event: string, evt?: any) {
  const listeners: Function[] = eventListeners[event];
  if (listeners) {
    listeners.forEach(function(listener) {
      listener(evt);
    });
  }
}

export const PluginManager = {
  loadMultiple,
  loadPlugin,
  exposeService,
  getService,
  generateScope,
  // injectInto,
  on,
  trigger
};
