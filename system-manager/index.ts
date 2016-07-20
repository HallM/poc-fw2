/// <reference path="../framework/_all.d.ts" />

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

export { Plugin } from './decorators/plugin';
export { InitPhase } from './decorators/init-phase';
export { After } from './decorators/after';
export { Before } from './decorators/before';
export { On } from './decorators/on';
export { Inject } from './decorators/inject';

function loadAsyncGroup(execNodes: PhaseGraphNode[]): Promise<any> {
  let p = Promise.resolve();
  const count = execNodes.length;

  return Promise.all(execNodes.map((node) => {
    return node.execute();
  })).then(() => {
    completedPhases = completedPhases.concat(execNodes);
  });
}

class BatchLoader {
  private graphNodes: PhaseGraphNode[]
  finalPromise: Promise<any>

  private resolver: Function
  private rejecter: Function

  constructor() {
    this.graphNodes = [];
    this.finalPromise = new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
  }

  addPlugin(PluginClass: any): Promise<any> {
    if (!PluginClass) {
      throw new Error('Cannot add null or undefined as a plugin');
    }

    const name: string = PluginClass.pluginName;
    if (!name) {
      throw new Error('Cannot add a plugin without a pluginName');
    }

    // get all "events", aka functions and their names
    // the event name is {plugin name}:{fn name}
    const plugin: any = new PluginClass();
    injectInto(plugin, null);

    const phases: string[] = Reflect.getMetadata(InitPhaseMetaKey, plugin) || [];

    phases.forEach(event => {
      const fn: Function = plugin[event];
      const waitsOn: any[] = Reflect.getMetadata(AfterMetaKey, plugin, event) || [];
      const blocks: any[] = Reflect.getMetadata(BeforeMetaKey, plugin, event) || [];
      const eventName: string = `${name}:${event}`;

      const node: PhaseGraphNode = this.findOrCreateNode(eventName);
      node.claimNode(plugin, fn);

      // TODO: handle the plugin:* node too

      waitsOn.forEach(dep => {
        const depNode: PhaseGraphNode = this.findOrCreateNode(dep.event);

        if (dep.required) {
          node.addDependency(depNode);
        } else {
          node.addWeakDependency(depNode);
        }
        node.addArgument(depNode);
        depNode.addDependent(node);
      });

      blocks.forEach(dep => {
        const depNode: PhaseGraphNode = this.findOrCreateNode(dep.event);

        // TODO: handle the plugin:* case
        if (dep.required) {
          node.addDependent(depNode);
        } else {
          node.addWeakDependent(depNode);
        }
        depNode.addDependency(node);
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

  private determineOrder(): PhaseGraphNode[][] {
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
        console.log(nodes);
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

let currentBatch: BatchLoader = null;
let completedPhases: PhaseGraphNode[] = [];
const globalServiceContext = new ServiceContext();

const eventListeners: any = {};

function batchLoad(callback: Function): Promise<any> {
  // don't run load for nested batches. all subbatches get loaded with the root-batch
  const willLoad = !currentBatch;
  if (!currentBatch) {
    currentBatch = new BatchLoader();
  }

  callback(currentBatch);

  if (willLoad) {
    const loader = currentBatch;
    currentBatch = null;
    return loader.loadAll();
  }

  return currentBatch.finalPromise;
}

function addPlugin(PluginClass: any): Promise<any> {
  if (currentBatch) {
    return currentBatch.addPlugin(PluginClass);
  } else {
    var loader = new BatchLoader();
    loader.addPlugin(PluginClass);
    return loader.loadAll();
  }
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

function injectInto(obj: any, scope?: ServiceContext) {
  const context = scope || globalServiceContext;
  const onEvents: string[] = Reflect.getMetadata(OnEventMetaKey, obj) || {};
  const injects: string[] = Reflect.getMetadata(InjectServiceMetaKey, obj) || {};

  for (let prop in onEvents) {
    on(onEvents[prop], obj[prop]);
  }

  for (let prop in injects) {
    obj[prop] = context.getService(injects[prop]);
  }
}

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
  batchLoad,
  addPlugin,
  exposeService,
  getService,
  generateScope,
  injectInto,
  on,
  trigger
};
