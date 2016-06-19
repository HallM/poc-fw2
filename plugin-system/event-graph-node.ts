'use strict';

export class EventGraphNode {
    // points to things that depend on this
    private outwardLinks: EventGraphNode[]

    // points to things that this depends on
    private inwardLinks: EventGraphNode[]

    private argumentNode: EventGraphNode[]

    // the function to execute
    private executor: Function
    private target: any

    private returnedValue: any

    constructor(public eventName: string) {
        this.outwardLinks = [];
        this.inwardLinks = [];
        this.argumentNode = [];
        this.executor = null;
        this.target = null;
        this.returnedValue = undefined;
    }

    claimNode(tgt: any, fn: Function) {
        this.target = tgt;
        this.executor = fn;
    }

    addArgument(node: EventGraphNode) {
        if (this.argumentNode.indexOf(node) === -1) {
            this.argumentNode.splice(0, 0, node);
        }
    }

    addDependentOn(node: EventGraphNode) {
        if (this.inwardLinks.indexOf(node) === -1) {
            this.inwardLinks.push(node);
        }
    }

    addDependencyOf(node: EventGraphNode) {
        if (this.outwardLinks.indexOf(node) === -1) {
            this.outwardLinks.push(node);
        }
    }

    removeDependent(node: EventGraphNode) {
        const index: number = this.outwardLinks.indexOf(node);
        // TODO: protect against index being invalid
        this.outwardLinks.splice(index, 1);
    }

    async execute() {
        const args = this.argumentNode.map(node => node.returnedValue);
        this.returnedValue = await this.executor.apply(this.target, args);
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
