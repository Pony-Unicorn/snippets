const createEE = (fn, context, once = false) => {
    const o = Object.create(null);
    o.fn = fn;
    o.context = context;
    o.once = once;
    return o;
};
export default class EventEmitter {
    constructor() {
        this._events = new Map();
    }
    on(eventName, fn, context) {
        this.addListener(eventName, fn, false, context);
    }
    once(eventName, fn, context) {
        this.addListener(eventName, fn, true, context);
    }
    addListener(eventName, fn, once, context = this) {
        if (this._events.has(eventName)) {
            this._events.get(eventName).add(createEE(fn, context, once));
        }
        else {
            this._events.set(eventName, new Set().add(createEE(fn, context, once)));
        }
    }
    off(eventName, fn, context) {
        this.removeListener(eventName, fn, true, context);
    }
    offOnce(eventName, fn, context) {
        this.removeListener(eventName, fn, false, context);
    }
    removeListener(eventName, fn, once, context) {
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
    clear() {
        this._events = new Map();
    }
    offNamesAll(eventName) {
        if (this._events.has(eventName))
            this._events.get(eventName).clear();
    }
    emit(eventName, ...rest) {
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
    listenerCount(eventName) {
        if (!this._events.has(eventName))
            return 0;
        return this._events.get(eventName).size;
    }
    eventNames() {
        const names = [];
        for (let key of this._events.keys()) {
            names.push(key);
        }
        return names;
    }
}
//# sourceMappingURL=EventEmitter.js.map