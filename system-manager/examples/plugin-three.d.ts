declare class MyPluginThree {
    blockedPhase(): number;
    concurrentThings(): Promise<{}>;
    onScopeGenerated(scope: any): void;
}
export = MyPluginThree;
