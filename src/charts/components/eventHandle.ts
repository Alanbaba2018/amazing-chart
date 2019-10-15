import { CommonObject } from '../typeof/type';
type EventMap = GlobalEventHandlers & {
  [k: string]: any;
}

interface EventObject<EventType> {
  target: any;
  evt: EventType;
  currentTarget: EventHandle;
}

type EventListener<This, EventType> = (this: This, evt: EventObject<EventType>) => void;

const CommonKeys: {[k: string]: string} = {
  Change: 'change'
}
export default class EventHandle {
  private eventListeners: {
    [k: string]: Array<{ name: string; handler: Function }>
  } = {};
  private attrs: {[k: string]: any} = {};
  public setAttrs(mapping: CommonObject) {
    for (const prop in mapping) {
      this.setAttr(prop, mapping[prop]);
    }
  }
  public setAttr(key: string, val: any) {
    const oval = this.attrs[key];
    if (oval === val) {
      return;
    }
    if (val === undefined || val === null) {
      delete this.attrs[key];
    } else {
      this.attrs[key] = val;
    }
    // To do fire attr change;
    this._fireChangeEvent(key, oval, val);
  }
  public on(evtStr: string, handler: Function) {
    const parts: string[] = (evtStr as string).split('.');
    const evt: string = parts[0];
    const namespace: string = parts[1] || '';
    if (!this.eventListeners[evt]) {
      this.eventListeners[evt] = [];
    }
    this.eventListeners[evt].push({
      name: namespace,
      handler: handler
    });
    return this;
  }
  public off(evtStr?: string, callback?: Function) {
    if (!evtStr) {
      for (const evt in this.eventListeners) {
        this._off(evt);
      }
    }
    const parts: string[] = (evtStr as string).split('.');
    const evt: string = parts[0];
    const namespace: string = parts[1] || '';
    if (evt && this.eventListeners[evt]) {
      this._off(evt, namespace, callback);
    } else {
      for (const et in this.eventListeners) {
        this._off(et, namespace, callback)
      }
    }
    return this;
  }
  public fire(eventType: string, evt: any = {}) {
    evt.target = evt.target || this;
    this._fire(eventType, evt);
    return this;
  }
  private _off(type: string, namespace?: string, callback?: Function) {
    const eventListeners = this.eventListeners[type];
    for (let i = eventListeners.length - 1; i >= 0; i--) {
      const eventListener = eventListeners[i];
      const { name, handler } = eventListener;
      if ((!namespace || name === namespace) && (!callback || callback === handler)) {
        eventListeners.splice(i, 1);
        if (eventListeners.length === 0) {
          delete this.eventListeners[type];
        }
      }
    }
  }
  private _fireChangeEvent(attr: string, oval: any, val: any) {
    this._fire(`${attr}${CommonKeys.Change}`, {
      oldVal: oval,
      newVal: val
    });
  }
  private _fire(eventType: string, evt: any = {}) {
    const eventListeners = this.eventListeners[eventType];
    if (eventListeners) {
      evt.currentTarget = this;
      evt.type = eventType;
      for (const eventListener of eventListeners) {
        eventListener.handler.call(this, evt);
      }
    }
  }
}