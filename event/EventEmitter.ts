interface IEE {
  fn: Function;
  context: any;
  once: boolean;
}

const createEE = (fn: Function, context: any, once = false): IEE => {
  const o: IEE = Object.create(null);
  o.fn = fn;
  o.context = context;
  o.once = once;
  return o;
};

/**
 * 事件派发器，虽然没有设置监听函数的最大限制
 * 但每个事件尽量不要超过 10 个监听函数
 * @author Created by pony on 2021/05/06.
 */
export default class EventEmitter<T> {
  private _events: Map<T, Set<IEE>>;

  public constructor() {
    this._events = new Map();
  }

  public on(eventName: T, fn: Function, context?: any): void {
    this.addListener(eventName, fn, false, context);
  }

  public once(eventName: T, fn: Function, context?: any): void {
    this.addListener(eventName, fn, true, context);
  }

  private addListener(
    eventName: T,
    fn: Function,
    once: boolean,
    context = this
  ): void {
    if (this._events.has(eventName)) {
      this._events.get(eventName).add(createEE(fn, context, once));
    } else {
      this._events.set(
        eventName,
        new Set<IEE>().add(createEE(fn, context, once))
      );
    }
  }

  public off(eventName: T, fn: Function, context?: any): void {
    this.removeListener(eventName, fn, true, context);
  }

  public offOnce(eventName: T, fn: Function, context?: any): void {
    this.removeListener(eventName, fn, false, context);
  }

  private removeListener(
    eventName: T,
    fn: Function,
    once: boolean,
    context?: any
  ): void {
    if (this._events.has(eventName)) {
      const ees = this._events.get(eventName);
      for (let ee of ees.values()) {
        if (fn === ee.fn && context === ee.context && ee.once === once) {
          ees.delete(ee);
          return;
        }
      }
    }
  }

  public clear(): void {
    this._events = new Map();
  }

  public offNamesAll(eventName: T): void {
    if (this._events.has(eventName)) this._events.get(eventName).clear();
  }

  public emit(eventName: T, ...rest: any[]): boolean {
    if (this._events.has(eventName)) {
      const ees = this._events.get(eventName);

      for (let ee of ees.values()) {
        if (ee.once) {
          this.removeListener(eventName, ee.fn, false, ee.context);
        }

        const len = rest.length;

        switch (len) {
          case 0:
            return ee.fn.call(ee.context), true;
          case 1:
            return ee.fn.call(ee.context, rest[0]), true;
          case 2:
            return ee.fn.call(ee.context, rest[0], rest[1]), true;
          case 3:
            return ee.fn.call(ee.context, rest[0], rest[1], rest[2]), true;
        }

        ee.fn.apply(ee.context, rest);
        return true;
      }
    }
    return false;
  }

  public listenerCount(eventName: T): number {
    if (!this._events.has(eventName)) return 0;
    return this._events.get(eventName).size;
  }

  public eventNames(): Array<T> {
    const names: Array<T> = [];
    for (let key of this._events.keys()) {
      names.push(key);
    }
    return names;
  }
}
