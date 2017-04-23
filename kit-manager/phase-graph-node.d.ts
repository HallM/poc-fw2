export declare class PhaseGraphNode {
    eventName: string;
    private outwardLinks;
    private inwardLinks;
    private argumentNode;
    private executor;
    private target;
    private returnedValue;
    constructor(eventName: string);
    claimNode(tgt: any, fn: Function): void;
    addArgument(node: PhaseGraphNode): void;
    addDependentOn(node: PhaseGraphNode): void;
    addDependencyOf(node: PhaseGraphNode): void;
    removeDependent(node: PhaseGraphNode): void;
    execute(): Promise<void>;
    getDependencies(): PhaseGraphNode[];
    isUnclaimed(): boolean;
    isSelf(event: string): boolean;
    isDepedencyOf(event: string): boolean;
    isDependentOn(event: string): boolean;
    isLeaf(): boolean;
    toString(): string;
}
