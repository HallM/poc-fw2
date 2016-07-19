declare class MyPluginOne {
    initPhase(two: any): number;
    concurrentThings(): Promise<{}>;
    onSomeEvent(): void;
    onScopeGenerated(scope: any): void;
}
export = MyPluginOne;
