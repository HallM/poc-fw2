'use strict';

export class PhaseGraphNode {
    // points to things that depend on this
    private dependents: PhaseGraphNode[]

    // points to things that this depends on
    private dependencies: PhaseGraphNode[]

    private argumentNode: PhaseGraphNode[]

    // the function to execute
    private executor: Function
    private target: any

    private returnedValue: any

    constructor(public eventName: string, public required: boolean = false) {
        this.dependents = [];
        this.dependencies = [];
        this.argumentNode = [];
        this.executor = null;
        this.target = null;
        this.returnedValue = undefined;
    }

    isRequired() {
        return this.required;
    }

    wouldBeReady(nodes: PhaseGraphNode[], ignoreUnRequired: boolean) {
        return this.dependencies.every(node => {
            return nodes.indexOf(node) !== -1 || (ignoreUnRequired && !node.required);
        });
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

    addDependency(node: PhaseGraphNode) {
        this.addWeakDependency(node);
        node.required = true;
    }

    addWeakDependency(node: PhaseGraphNode) {
        if (this.dependencies.indexOf(node) === -1) {
            this.dependencies.push(node);
        }
    }

    addDependent(node: PhaseGraphNode) {
        this.addWeakDependent(node);
        node.required = true;
    }

    addWeakDependent(node: PhaseGraphNode) {
        if (this.dependents.indexOf(node) === -1) {
            this.dependents.push(node);
        }
    }

    execute() {
        const args = this.argumentNode.map(node => node.returnedValue);

        return Promise
            .resolve(this.executor.apply(this.target, args))
            .then((value) => {
                this.returnedValue = value;
            });
    }

    getDependencies(): PhaseGraphNode[] {
        return this.dependencies.slice();
    }

    isUnclaimed(): boolean {
        return this.executor === null;
    }

    isSelf(event: string): boolean {
        return event === this.eventName;
    }

    isDepedencyOf(event: string): boolean {
        // TODO: infinity loop when circular dependency
        return this.isSelf(event) || this.dependents.some(link => link.isDepedencyOf(event));
    }

    isDependentOn(event: string): boolean {
        // TODO: infinity loop when circular dependency
        return this.isSelf(event) || this.dependencies.some(link => link.isDependentOn(event));
    }

    isLeaf(): boolean {
        return this.dependents.length === 0;
    }

    toString(): string {
        return this.eventName;
    }
}
