/// <reference path="../lib/_all.d.ts" />

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

import { EventGraphNode } from './event-graph-node';

import { WaitOnMetaKey } from './decorators/wait-on';
import { BlockMetaKey } from './decorators/block';

export { WaitOn } from './decorators/wait-on';
export { Block } from './decorators/block';

enum PmPhase {
    Discovery,
    Sorting,
    Ready,
    Loading,
    Loaded
}

export class PluginManager {
    phase: PmPhase

    // this becomes sorted in execution order when in Ready phase
    graphNodes: EventGraphNode[]

    constructor() {
        this.graphNodes = [];
        this.phase = PmPhase.Discovery;
    }

    private requirePhase(required: PmPhase, error: string) {
        if (this.phase !== required) {
            throw new Error(error);
        }
    }

    private findOrCreateNode(eventName: string): EventGraphNode {
        const foundNode: EventGraphNode = this.graphNodes.find(node => node.isSelf(eventName));
        if (!foundNode) {
            const newNode = new EventGraphNode(eventName);
            this.graphNodes.push(newNode);
            return newNode;
        } else {
            return foundNode;
        }
    }

    addPlugin(name: string, plugin: any) {
        this.requirePhase(PmPhase.Discovery, 'Cannot add plugins once plugin discovery phase is complete.');

        // get all "events", aka functions and their names
        // the event name is {plugin name}:{fn name}

        const prototype = Object.getPrototypeOf(plugin);

        const events: string[] = Object
            .getOwnPropertyNames(prototype)
            .filter(property => property !== 'constructor' && typeof prototype[property] == 'function');

        events.forEach(event => {
            const fn: Function = plugin[event];
            const waitsOn: string[] = Reflect.getMetadata(WaitOnMetaKey, plugin, event) || [];
            const blocks: string[] = Reflect.getMetadata(BlockMetaKey, plugin, event) || [];
            const eventName: string = `${name}:${event}`;

            const node: EventGraphNode = this.findOrCreateNode(eventName);
            node.claimNode(fn);

            // TODO: handle the plugin:* node too

            waitsOn.forEach(dep => {
                const depNode: EventGraphNode = this.findOrCreateNode(dep);
                node.addDependentOn(depNode);
                depNode.addDependencyOf(node);
            });

            blocks.forEach(dep => {
                const depNode: EventGraphNode = this.findOrCreateNode(dep);

                // TODO: handle the plugin:* case
                depNode.addDependentOn(node);
                node.addDependencyOf(depNode);
            });
        });
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

    loadAll() {
        this.requirePhase(PmPhase.Ready, 'Cannot load plugins until execution order is ready.');

        this.phase = PmPhase.Loading;
        this.graphNodes.forEach(node => node.execute());

        // just remove all the nodes to clear any memory and also prevent re-loads
        this.graphNodes = [];
        this.phase = PmPhase.Loaded;
    }
}