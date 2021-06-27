export default class EventEmitter<T> {
    private _events;
    constructor();
    on(eventName: T, fn: Function, context?: any): void;
    once(eventName: T, fn: Function, context?: any): void;
    private addListener;
    off(eventName: T, fn: Function, context?: any): void;
    offOnce(eventName: T, fn: Function, context?: any): void;
    private removeListener;
    clear(): void;
    offNamesAll(eventName: T): void;
    emit(eventName: T, ...rest: any[]): boolean;
    listenerCount(eventName: T): number;
    eventNames(): Array<T>;
}
