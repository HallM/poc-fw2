import 'reflect-metadata';
export declare const BeforeMetaKey: symbol;
export declare function Before(event: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
