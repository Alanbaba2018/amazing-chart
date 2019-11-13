import { isMobile } from '../util/helper'

const PCEvents = {
  mousedown: {
    eventName: 'mousedown',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
  mousemove: {
    eventName: 'mousemove',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
  mouseup: {
    eventName: 'mouseup',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
  mouseout: {
    eventName: 'mouseout',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
  wheel: {
    eventName: 'wheel',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
  click: {
    eventName: 'click',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
}

const MobileEvents = {
  mousedown: {
    eventName: 'touchstart',
    handler(callback: Function, evt: TouchEvent) {
      callback({
        clientX: evt.changedTouches[0].clientX,
        clientY: evt.changedTouches[0].clientY,
        target: evt.target,
        originEvent: evt,
      })
    },
  },
  mousemove: {
    eventName: 'touchmove',
    handler(callback: Function, evt: TouchEvent) {
      callback({
        clientX: evt.changedTouches[0].clientX,
        clientY: evt.changedTouches[0].clientY,
        target: evt.target,
        originEvent: evt,
      })
    },
  },
  mouseup: {
    eventName: 'touchend',
    handler(callback: Function, evt: TouchEvent) {
      callback({
        clientX: evt.changedTouches[0].clientX,
        clientY: evt.changedTouches[0].clientY,
        target: evt.target,
        originEvent: evt,
      })
    },
  },
  wheel: {
    eventName: 'wheel',
    handler(callback: Function, evt: Event) {
      callback(evt)
    },
  },
  click: {
    eventName: 'click',
    handler(callback: Function, evt: Event) {
      callback(evt)
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
  on(target: HTMLElement | Document, eventType: string, callback: EventListener) {
    // eventName + nameSpace is only eventID
    const { eventName, nameSpace, handler } = this.getEventName(eventType)
    if (!eventName) return
    const _handler = handler.bind(null, callback)
    let eventObject = this.eventPool.get(target)
    if (!eventObject) {
      const eventMap = new Map()
      eventObject = { [eventName]: eventMap }
      this.eventPool.set(target, eventObject)
    }
    if (!eventObject[eventName]) {
      eventObject[eventName] = new Map()
    }
    const handlerMap: Map<EventListener, EventListener> = new Map()
    handlerMap.set(callback, _handler)
    eventObject[eventName].set(nameSpace, handlerMap)
    target.addEventListener(eventName, _handler)
    return this
  },
  off(target: HTMLElement | Document, eventType: string, callback?: EventListener) {
    const { eventName, nameSpace } = this.getEventName(eventType)
    if (!eventName) return
    const eventObject = this.eventPool.get(target)
    if (eventObject && eventObject[eventName]) {
      const eventMap: Map<string, Map<EventListener, EventListener>> = eventObject[eventName]
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
