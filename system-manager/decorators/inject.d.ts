import 'reflect-metadata';
export declare const InjectServiceMetaKey: symbol;
export declare function Inject(name: string): (target: any, propertyKey: string) => void;
