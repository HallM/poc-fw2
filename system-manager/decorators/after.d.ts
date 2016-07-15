import 'reflect-metadata';
export declare const AfterMetaKey: symbol;
export declare function After(event: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
