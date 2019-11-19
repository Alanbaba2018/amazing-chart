import { isMobile } from '../util/helper'

const PCEvents = {
  mousedown: {
    eventName: 'mousedown',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  mousemove: {
    eventName: 'mousemove',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  mouseup: {
    eventName: 'mouseup',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  mouseout: {
    eventName: 'mouseout',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  wheel: {
    eventName: 'wheel',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  click: {
    eventName: 'click',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  resize: {
    eventName: 'resize',
    handler(callback: Function) {
      callback()
    },
  },
}

const MobileEvents = {
  mousedown: {
    eventName: 'touchstart',
    handler(callback: Function, evt: TouchEvent) {
      const e = { originEvent: evt }
      Array.from(evt.changedTouches).forEach((touch, index) => {
        const x = index === 0 ? 'clientX' : `clientX${index}`
        const y = index === 0 ? 'clientY' : `clientY${index}`
        e[x] = touch.clientX
        e[y] = touch.clientY
      })
      callback(e)
    },
  },
  mousemove: {
    eventName: 'touchmove',
    handler(callback: Function, evt: TouchEvent) {
      const e = { originEvent: evt }
      Array.from(evt.changedTouches).forEach((touch, index) => {
        const x = index === 0 ? 'clientX' : `clientX${index}`
        const y = index === 0 ? 'clientY' : `clientY${index}`
        e[x] = touch.clientX
        e[y] = touch.clientY
      })
      callback(e)
    },
  },
  mouseup: {
    eventName: 'touchend',
    handler(callback: Function, evt: TouchEvent) {
      const e = { originEvent: evt }
      Array.from(evt.changedTouches).forEach((touch, index) => {
        const x = index === 0 ? 'clientX' : `clientX${index}`
        const y = index === 0 ? 'clientY' : `clientY${index}`
        e[x] = touch.clientX
        e[y] = touch.clientY
      })
      callback(e)
    },
  },
  wheel: {
    eventName: 'wheel',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
  click: {
    eventName: 'click',
    handler(callback: Function, evt: MouseEvent) {
      callback({ originEvent: evt, clientX: evt.clientX, clientY: evt.clientY })
    },
  },
}

const EventProxy = {
  eventPool: new Map(),
  getEventName(name: string): { eventName: keyof HTMLElementEventMap; nameSpace: string; handler: EventListener } {
    const nl = name.split('.')
    const _name = nl[0]
    const nameSpace = nl[1] || ''
    const _isMobile = isMobile()
    const _event = (_isMobile ? MobileEvents[_name] : PCEvents[_name]) || {}
    _event.nameSpace = nameSpace
    return _event
  },
  on(target: HTMLElement | Document | Window, eventType: string, callback: Function) {
    // eventName + nameSpace is only eventID
    const { eventName, nameSpace, handler } = this.getEventName(eventType)
    if (!eventName) return
    const _handler = handler.bind(null, callback as any)
    let eventObject = this.eventPool.get(target)
    if (!eventObject) {
      const eventMap = new Map()
      eventObject = { [eventName]: eventMap }
      this.eventPool.set(target, eventObject)
    }
    if (!eventObject[eventName]) {
      eventObject[eventName] = new Map()
    }
    const handlerMap: Map<Function, EventListener> = new Map()
    handlerMap.set(callback, _handler)
    eventObject[eventName].set(nameSpace, handlerMap)
    target.addEventListener(eventName, _handler)
    return this
  },
  off(target: HTMLElement | Document, eventType: string, callback?: Function) {
    const { eventName, nameSpace } = this.getEventName(eventType)
    if (!eventName) return
    const eventObject = this.eventPool.get(target)
    if (eventObject && eventObject[eventName]) {
      const eventMap: Map<string, Map<Function, EventListener>> = eventObject[eventName]
      const handlerMap = eventMap.get(nameSpace)
      if (!callback && !nameSpace) {
        Array.from(eventMap.values()).forEach(_handlerMap => {
          Array.from(_handlerMap.values()).forEach(_handler => {
            target.removeEventListener(eventName, _handler)
          })
        })
        eventMap.clear()
      } else if (handlerMap && callback) {
        const _handler = handlerMap.get(callback)
        _handler && target.removeEventListener(eventName, _handler)
      }
      if (eventMap.size === 0) {
        delete eventObject[eventName]
      }
      if (Object.keys(eventObject).length === 0) {
        this.eventPool.delete(target)
      }
    }
    return this
  },
}

export default EventProxy
