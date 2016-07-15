'use strict';

export class PhaseGraphNode {
    // points to things that depend on this
    private outwardLinks: PhaseGraphNode[]

    // points to things that this depends on
    private inwardLinks: PhaseGraphNode[]

    private argumentNode: PhaseGraphNode[]

    // the function to execute
    private executor: Function
    private target: any

    constructor(public eventName: string) {
        this.outwardLinks = [];
        this.inwardLinks = [];
        this.argumentNode = [];
        this.executor = null;
        this.target = null;
    }

    claimNode(tgt: any, fn: Function) {
        this.target = tgt;
        this.executor = fn;
    }

    addArgument(node: PhaseGraphNode) {
        if (this.argumentNode.indexOf(node) === -1) {
            this.argumentNode.splice(0, 0, node);
        }
    }

    addDependentOn(node: PhaseGraphNode) {
        if (this.inwardLinks.indexOf(node) === -1) {
            this.inwardLinks.push(node);
        }
    }

    addDependencyOf(node: PhaseGraphNode) {
        if (this.outwardLinks.indexOf(node) === -1) {
            this.outwardLinks.push(node);
        }
    }

    removeDependent(node: PhaseGraphNode) {
        const index: number = this.outwardLinks.indexOf(node);
        // TODO: protect against index being invalid
        this.outwardLinks.splice(index, 1);
    }

    execute() {
        return this.executor.apply(this.target, []);
    }

    getDependencies(): PhaseGraphNode[] {
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
