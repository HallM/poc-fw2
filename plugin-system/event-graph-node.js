'use strict';
class EventGraphNode {
    constructor(eventName) {
        this.eventName = eventName;
        this.outwardLinks = [];
        this.inwardLinks = [];
        this.executor = null;
    }
    claimNode(fn) {
        this.executor = fn;
    }
    addDependentOn(node) {
        this.inwardLinks.push(node);
    }
    addDependencyOf(node) {
        this.outwardLinks.push(node);
    }
    removeDependent(node) {
        const index = this.outwardLinks.indexOf(node);
        // TODO: protect against index being invalid
        this.outwardLinks.splice(index, 1);
    }
    execute() {
        this.executor();
    }
    getDependencies() {
        return this.inwardLinks.slice();
    }
    isUnclaimed() {
        return this.executor === null;
    }
    isSelf(event) {
        return event === this.eventName;
    }
    isDepedencyOf(event) {
        // TODO: infinity loop when circular dependency
        return this.isSelf(event) || this.outwardLinks.some(link => link.isDepedencyOf(event));
    }
    isDependentOn(event) {
        // TODO: infinity loop when circular dependency
        return this.isSelf(event) || this.inwardLinks.some(link => link.isDependentOn(event));
    }
    isLeaf() {
        return this.outwardLinks.length === 0;
    }
    toString() {
        return this.eventName;
    }
}
exports.EventGraphNode = EventGraphNode;
