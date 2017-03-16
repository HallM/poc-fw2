'use strict';

export class PhaseGraphNode {
    // points to things that depend on this
    private dependents: PhaseGraphNode[]

    // points to things that this depends on
    private dependencies: PhaseGraphNode[]

    private getProvider: string[]
    private provides: string[]

    // the function to execute
    private executor: Function
    private target: any

    constructor(public eventName: string, public required: boolean = false) {
        this.dependents = [];
        this.dependencies = [];
        this.getProvider = [];
        this.provides = [];
        this.executor = null;
        this.target = null;
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

    addProvides(serviceName: string) {
        if (this.provides.indexOf(serviceName) === -1) {
            this.provides.push(serviceName);
        }
    }
    addGetProvider(serviceName: string) {
        if (this.getProvider.indexOf(serviceName) === -1) {
            this.getProvider.push(serviceName);
        }
    }

    addDependency(node: PhaseGraphNode) {
        this.addWeakDependency(node);
        node.required = true;
    }

    addWeakDependency(node: PhaseGraphNode) {
        // make sure our new dependency is not dependent on self
        if (node.isDependentOn(this.toString())) {
            throw new Error(`Circular dependencies detected between "${node.toString()}" and ${this.toString()}`);
        }

        if (this.dependencies.indexOf(node) === -1) {
            this.dependencies.push(node);
        }
    }

    addDependent(node: PhaseGraphNode) {
        this.addWeakDependent(node);
        node.required = true;
    }

    addWeakDependent(node: PhaseGraphNode) {
        // make sure our new dependent (who needs us) does not have self as a dependency
        if (node.isDepedencyOf(this.toString())) {
            throw new Error(`Circular dependencies detected between "${node.toString()}" and ${this.toString()}`);
        }

        if (this.dependents.indexOf(node) === -1) {
            this.dependents.push(node);
        }
    }

    execute(args: any[] = []) {
        return Promise.resolve(this.executor.apply(this.target, args))
    }

    providesServices(): string[] {
        return this.provides.slice();
    }
    wantsProviders(): string[] {
        return this.getProvider.slice();
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

    // while this could go infinite loop, the addDependency/addDependent should protect against this
    isDepedencyOf(event: string): boolean {
        return this.isSelf(event) || this.dependents.some(link => link.isDepedencyOf(event));
    }

    isDependentOn(event: string): boolean {
        return this.isSelf(event) || this.dependencies.some(link => link.isDependentOn(event));
    }

    isLeaf(): boolean {
        return this.dependents.length === 0;
    }

    toString(): string {
        return this.eventName;
    }
}
