import { CommonObject, CommonKeys } from '../typeof/type'
import { getDevicePixelRatio, isMobile } from '../util/helper'

export default abstract class EventHandle {
  private eventListeners: {
    [k: string]: Array<{ name: string; handler: Function; global?: boolean }>
  } = {}

  private watchMap: Map<string, HTMLElement[]> = new Map()

  public config: CommonObject = {
    devicePixelRatio: getDevicePixelRatio(),
    isMobile: isMobile(),
  }

  public getConfig(): CommonObject {
    return this.config
  }

  public setAttrs(config: CommonObject) {
    Object.keys(config).forEach(prop => {
      this.setAttr(prop, config[prop])
    })
  }

  public getAttr(key: string) {
    return this.config[key]
  }

  public setAttr(key: string, val: any) {
    const oval = this.config[key]
    if (oval === val) {
      return
    }
    if (val === undefined || val === null) {
      delete this.config[key]
    } else {
      this.config[key] = val
    }
    // To do fire attr change;
    this._fireChangeEvent(key, oval, val)
  }

  public on(evtStr: string, handler: Function, global: boolean = false) {
    const parts: string[] = (evtStr as string).split('.')
    const evt: string = parts[0]
    const namespace: string = parts[1] || ''
    if (!this.eventListeners[evt]) {
      this.eventListeners[evt] = []
    }
    this.eventListeners[evt].push({
      name: namespace,
      handler,
      global,
    })
    return this
  }

  public off(evtStr?: string, callback?: Function) {
    if (!evtStr) {
      Object.keys(this.eventListeners).forEach(evt => {
        this._off(evt)
      })
    }
    const parts: string[] = (evtStr as string).split('.')
    const evt: string = parts[0]
    const namespace: string = parts[1] || ''
    if (evt && this.eventListeners[evt]) {
      this._off(evt, namespace, callback)
    } else {
      Object.keys(this.eventListeners).forEach(et => {
        this._off(et, namespace, callback)
      })
    }
    return this
  }

  public fire(eventType: string, evt: any = {}) {
    evt.target = evt.target || this
    this._fire(eventType, evt)
    return this
  }

  public watchProperty(obj: Object, key: string, target: HTMLElement) {
    this.watchMap.set(key, [target])
    Object.defineProperty(obj, key, {
      get() {
        return obj[key]
      },
      set() {},
    })
  }

  public setWatchProperty(obj: Object, key: string, value: string, styles: Object = {}) {
    obj[key] = value
    const watchList = this.watchMap.get(key)
    if (watchList) {
      watchList.forEach(ele => {
        ele.textContent = value
        Object.keys(styles).forEach(cssKey => {
          ele.style[cssKey] = styles[cssKey]
        })
      })
    }
  }

  private _off(type: string, namespace?: string, callback?: Function) {
    const eventListeners = this.eventListeners[type]
    for (let i = eventListeners.length - 1; i >= 0; i--) {
      const eventListener = eventListeners[i]
      const { name, handler } = eventListener
      if ((!namespace || name === namespace) && (!callback || callback === handler)) {
        eventListeners.splice(i, 1)
        if (eventListeners.length === 0) {
          delete this.eventListeners[type]
        }
      }
    }
  }

  private _fireChangeEvent(attr: string, oval: any, val: any) {
    this._fire(`${attr}${CommonKeys.Change}`, {
      oldVal: oval,
      newVal: val,
    })
  }

  private _fire(eventType: string, evt: any = {}) {
    const eventListeners = this.eventListeners[eventType]
    if (eventListeners) {
      evt.currentTarget = this
      evt.type = eventType
      eventListeners.forEach(eventListener => {
        eventListener.handler.call(this, evt)
      })
    }
  }
}
