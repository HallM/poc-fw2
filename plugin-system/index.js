/// <reference path="../lib/_all.d.ts" />
"use strict";
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
const event_graph_node_1 = require('./event-graph-node');
const wait_on_1 = require('./decorators/wait-on');
const block_1 = require('./decorators/block');
var wait_on_2 = require('./decorators/wait-on');
exports.WaitOn = wait_on_2.WaitOn;
var block_2 = require('./decorators/block');
exports.Block = block_2.Block;
var PmPhase;
(function (PmPhase) {
    PmPhase[PmPhase["Discovery"] = 0] = "Discovery";
    PmPhase[PmPhase["Sorting"] = 1] = "Sorting";
    PmPhase[PmPhase["Ready"] = 2] = "Ready";
    PmPhase[PmPhase["Loading"] = 3] = "Loading";
    PmPhase[PmPhase["Loaded"] = 4] = "Loaded";
})(PmPhase || (PmPhase = {}));
class PluginManager {
    constructor() {
        this.graphNodes = [];
        this.phase = PmPhase.Discovery;
    }
    requirePhase(required, error) {
        if (this.phase !== required) {
            throw new Error(error);
        }
    }
    findOrCreateNode(eventName) {
        const foundNode = this.graphNodes.find(node => node.isSelf(eventName));
        if (!foundNode) {
            const newNode = new event_graph_node_1.EventGraphNode(eventName);
            this.graphNodes.push(newNode);
            return newNode;
        }
        else {
            return foundNode;
        }
    }
    addPlugin(name, plugin) {
        this.requirePhase(PmPhase.Discovery, 'Cannot add plugins once plugin discovery phase is complete.');
        // get all "events", aka functions and their names
        // the event name is {plugin name}:{fn name}
        const prototype = Object.getPrototypeOf(plugin);
        const events = Object
            .getOwnPropertyNames(prototype)
            .filter(property => property !== 'constructor' && typeof prototype[property] == 'function');
        events.forEach(event => {
            const fn = plugin[event];
            const waitsOn = Reflect.getMetadata(wait_on_1.WaitOnMetaKey, plugin, event) || [];
            const blocks = Reflect.getMetadata(block_1.BlockMetaKey, plugin, event) || [];
            const eventName = `${name}:${event}`;
            const node = this.findOrCreateNode(eventName);
            node.claimNode(fn);
            // TODO: handle the plugin:* node too
            waitsOn.forEach(dep => {
                const depNode = this.findOrCreateNode(dep);
                node.addDependentOn(depNode);
                depNode.addDependencyOf(node);
            });
            blocks.forEach(dep => {
                const depNode = this.findOrCreateNode(dep);
                // TODO: handle the plugin:* case
                depNode.addDependentOn(node);
                node.addDependencyOf(depNode);
            });
        });
    }
    checkForUnclaimed() {
        const unclaimed = this
            .graphNodes
            .filter(node => node.isUnclaimed());
        if (unclaimed.length) {
            const missingNames = unclaimed.map(node => node.toString()).join(', ');
            throw new Error('The following plugins are missing: ' + missingNames);
        }
    }
    determineOrder() {
        this.requirePhase(PmPhase.Discovery, 'Cannot determine order once out of discovery.');
        this.phase = PmPhase.Sorting;
        this.checkForUnclaimed();
        let execStack = [];
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
exports.PluginManager = PluginManager;
