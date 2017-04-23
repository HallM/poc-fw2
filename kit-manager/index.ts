/// <reference path="../_all.d.ts" />

/*
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

export { InitPhase } from './decorators/init-phase';
export { After } from './decorators/after';
export { Before } from './decorators/before';
export { On } from './decorators/on';
export { Inject } from './decorators/inject';
export { ReturnsService } from './decorators/returns-service';

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
  private wildcardNodes: PhaseGraphNode[]
  finalPromise: Promise<any>

  private serviceToNodeMap: any

  private resolver: Function
  private rejecter: Function

  constructor() {
    this.graphNodes = [];
    this.wildcardNodes = [];
    this.serviceToNodeMap = {};

    this.finalPromise = new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
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

  addKit(KitClass: any, kitOptions?: any): Promise<any> {
    if (!KitClass) {
      throw new Error('Cannot add null or undefined as a kit');
    }

    const name: string = KitClass.name || KitClass.kitName;
    if (!name) {
      throw new Error('Cannot add a kit without a defined kitName');
    }

    // get all "events", aka functions and their names
    // the event name is ${kit name}:${fn name}
    const kit: any = new KitClass(kitOptions);

    const phases: string[] = Reflect.getMetadata(InitPhaseMetaKey, kit) || [];
    const inject: any[] = Reflect.getMetadata(InjectServiceMetaKey, kit) || [];

    phases.forEach(event => {
      const fn: Function = kit[event];
      const waitsOn: any[] = Reflect.getMetadata(AfterMetaKey, kit, event) || [];
      const blocks: any[] = Reflect.getMetadata(BeforeMetaKey, kit, event) || [];

      const provides: any[] = Reflect.getMetadata(ReturnsServiceMetaKey, kit, event) || [];
      const provided: any[] = Reflect.getMetadata(InjectServiceMetaKey, kit, event) || [];

      const eventName: string = `${name}:${event}`;

      const node: PhaseGraphNode = this.findOrCreateNode(eventName);
      node.claimNode(kit, fn);

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

      provided.concat(inject).forEach((serviceInfo) => {
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

  private mapWildCards() {
    this.wildcardNodes.forEach((wildcard) => {
      const relatedNodes = this.graphNodes.filter((node) => node.matchesWildcard(wildcard.eventName));
      wildcard.replaceWith(relatedNodes);
    });

    this.graphNodes = this.graphNodes.filter(node => this.wildcardNodes.indexOf(node) === -1);
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
    this.mapWildCards();

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

      if (eventName.indexOf(':') === -1) {
        this.wildcardNodes.push(newNode);
      }

      return newNode;
    } else {
      return foundNode;
    }
  }

  private checkForUnclaimed(nodes: PhaseGraphNode[]) {
    const unclaimed: PhaseGraphNode[] = nodes.filter(node => node.isUnclaimed() && node.isRequired());

    if (unclaimed.length) {
      const missingNames: string = unclaimed.map(node => node.toString()).join(', ');
      throw new Error('The following kits are missing: ' + missingNames);
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

function loadKit(KitClass: any): Promise<any> {
  // using a "batch" because BatchLoader has the logic
  var loader = new BatchLoader();
  loader.addKit(KitClass);
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
    listeners.forEach((listener) => {
      listener(evt);
    });
  }
}

export const KitManager = {
  loadMultiple,
  loadKit,
  exposeService,
  getService,
  generateScope,
  on,
  trigger
};
