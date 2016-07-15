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

export { Plugin } from './decorators/plugin';
export { InitPhase } from './decorators/init-phase';
export { After } from './decorators/after';
export { Before } from './decorators/before';

class BatchLoader {
  private graphNodes: PhaseGraphNode[]

  constructor() {
    this.graphNodes = [];
  }

  addPlugin(PluginClass: any) {
    if (!PluginClass) {
      throw new Error('Cannot add null or undefined as a plugin');
    }

    // get all "events", aka functions and their names
    // the event name is {plugin name}:{fn name}
    const plugin: any = new PluginClass();
    const name: string = PluginClass.pluginName;
    if (!name) {
      throw new Error('Cannot add a plugin without a pluginName');
    }

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
    const unclaimed: EventGraphNode[] = this
      .graphNodes
      .filter(node => node.isUnclaimed());

    if (unclaimed.length) {
      const missingNames: string = unclaimed.map(node => node.toString()).join(', ');
      throw new Error('The following plugins are missing: ' + missingNames);
    }
  }
}

export class PluginManager {
    // this becomes sorted in execution order when in Ready phase
    private services: any[]

    constructor() {
        this.services = [];
    }

    addBatch(callback: Function) {

    }

    addPlugin(PluginClass: Plugin) {
    }


    determineOrder() {
        this.requirePhase(PmPhase.Discovery, 'Cannot determine order once out of discovery.');

        this.phase = PmPhase.Sorting;

        this.checkForUnclaimed();

        let execStack: EventGraphNode[] = [];

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
        this.graphNodes = execStack;
        this.phase = PmPhase.Ready;
    }

    async loadAll() {
        this.requirePhase(PmPhase.Ready, 'Cannot load plugins until execution order is ready.');

        this.phase = PmPhase.Loading;
        const count = this.graphNodes.length;
        for (let i=0; i < count; i++) {
            await this.graphNodes[i].execute();
        }

        // just remove all the nodes to clear any memory and also prevent re-loads
        this.graphNodes = [];
        this.phase = PmPhase.Loaded;
    }
}
