'use strict';

export class EventGraphNode {
    // points to things that depend on this
    private outwardLinks: EventGraphNode[]

    // points to things that this depends on
    private inwardLinks: EventGraphNode[]

    // the function to execute
    private executor: Function

    constructor(public eventName: string) {
        this.outwardLinks = [];
        this.inwardLinks = [];
        this.executor = null;
    }

    claimNode(fn: Function) {
        this.executor = fn;
    }

    addDependentOn(node: EventGraphNode) {
        this.inwardLinks.push(node);
    }

    addDependencyOf(node: EventGraphNode) {
        this.outwardLinks.push(node);
    }

    removeDependent(node: EventGraphNode) {
        const index: number = this.outwardLinks.indexOf(node);
        // TODO: protect against index being invalid
        this.outwardLinks.splice(index, 1);
    }

    execute() {
        this.executor();
    }

    getDependencies(): EventGraphNode[] {
        return this.inwardLinks.slice();
    }

    isUnclaimed(): boolean {
        return this.executor === null;
    }

    isSelf(event: string): boolean {
        return event === this.eventName;
    }

    isDepedencyOf(event: string): boolean {
        // TODO: infinity loop when circular dependency
        return this.isSelf(event) || this.outwardLinks.some(link => link.isDepedencyOf(event));
    }

    isDependentOn(event: string): boolean {
        // TODO: infinity loop when circular dependency
        return this.isSelf(event) || this.inwardLinks.some(link => link.isDependentOn(event));
    }

    isLeaf(): boolean {
        return this.outwardLinks.length === 0;
    }

    toString(): string {
        return this.eventName;
    }
}
