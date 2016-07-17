declare class MyPluginOne {
    initPhase(): void;
    onSomeEvent(): void;
    onScopeGenerated(scope: any): void;
}
export = MyPluginOne;
