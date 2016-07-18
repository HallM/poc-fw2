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

class BatchLoader {
  private graphNodes: PhaseGraphNode[]

  constructor() {
    this.graphNodes = completedPhases.slice();
  }

  addPlugin(PluginClass: any) {
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
      const waitsOn: string[] = Reflect.getMetadata(AfterMetaKey, plugin, event) || [];
      const blocks: string[] = Reflect.getMetadata(BeforeMetaKey, plugin, event) || [];
      const eventName: string = `${name}:${event}`;

      const node: PhaseGraphNode = this.findOrCreateNode(eventName);
      node.claimNode(plugin, fn);

      // TODO: handle the plugin:* node too

      waitsOn.forEach(dep => {
        const depNode: PhaseGraphNode = this.findOrCreateNode(dep);
        node.addDependentOn(depNode);
        node.addArgument(depNode);
        depNode.addDependencyOf(node);
      });

      blocks.forEach(dep => {
        const depNode: PhaseGraphNode = this.findOrCreateNode(dep);

        // TODO: handle the plugin:* case
        depNode.addDependentOn(node);
        node.addDependencyOf(depNode);
      });
    });
  }

  loadAll() {
    const execStack = this.determineOrder();

    const count = execStack.length;

    for (let i=0; i < count; i++) {
      execStack[i].execute();
    }

    return execStack;
  }

  private determineOrder(): PhaseGraphNode[] {
    this.checkForUnclaimed();

    let execStack: PhaseGraphNode[] = [];

    while (this.graphNodes.length) {
      const preLength = this.graphNodes.length;
      const foundNodes = this.graphNodes.filter(node => node.isLeaf());
      if (foundNodes.length === 0) {
        // TODO: is it possible to find these?
        throw new Error('Cannot satisfy all dependencies. A circular dependency may exist.');
      }

      foundNodes.forEach(node => {
        // remove the links to the foundNodes
        const deps = node.getDependencies();
        deps.forEach(dep => dep.removeDependent(node));

        // and also add to the execStack
        execStack.push(node);
      });

      // remove the foundNodes from the list of graphNodes
      this.graphNodes = this.graphNodes.filter(node => foundNodes.indexOf(node) === -1);
    }

    execStack.reverse();
    return execStack;
  }

  private findOrCreateNode(eventName: string): PhaseGraphNode {
    const foundNode: PhaseGraphNode = this.graphNodes.find(node => node.isSelf(eventName));
    if (!foundNode) {
      const newNode = new PhaseGraphNode(eventName);
      this.graphNodes.push(newNode);
      return newNode;
    } else {
      return foundNode;
    }
  }

  private checkForUnclaimed() {
    const unclaimed: PhaseGraphNode[] = this
      .graphNodes
      .filter(node => node.isUnclaimed());

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

function batchLoad(callback: Function) {
  // don't run load for nested batches. all subbatches get loaded with the root-batch
  const willLoad = !currentBatch;
  if (!currentBatch) {
    currentBatch = new BatchLoader();
  }

  callback(currentBatch);

  if (willLoad) {
    const loader = currentBatch;
    currentBatch = null;
    completedPhases = completedPhases.concat(loader.loadAll());
  }
}

function addPlugin(PluginClass: any) {
  if (currentBatch) {
    currentBatch.addPlugin(PluginClass);
  } else {
    var loader = new BatchLoader();
    loader.addPlugin(PluginClass);
    completedPhases = completedPhases.concat(loader.loadAll());
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
