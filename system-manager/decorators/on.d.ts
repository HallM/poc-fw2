import 'reflect-metadata';
export declare const OnEventMetaKey: symbol;
export declare function On(event: string): (target: any, propertyKey: string) => void;
