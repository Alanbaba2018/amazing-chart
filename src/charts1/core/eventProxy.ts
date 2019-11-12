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
      callback(
        cloneEventObj(evt, {
          clientX: evt.changedTouches[0].clientX,
          clientY: evt.changedTouches[0].clientY,
        }),
      )
    },
  },
  mousemove: {
    eventName: 'touchmove',
    handler(callback: Function, evt: TouchEvent) {
      callback(
        cloneEventObj(evt, {
          clientX: evt.changedTouches[0].clientX,
          clientY: evt.changedTouches[0].clientY,
        }),
      )
    },
  },
  mouseup: {
    eventName: 'touchend',
    handler(callback: Function, evt: TouchEvent) {
      callback(
        cloneEventObj(evt, {
          clientX: evt.changedTouches[0].clientX,
          clientY: evt.changedTouches[0].clientY,
        }),
      )
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

function cloneEventObj(eventObj: Event, overrideObj = {}) {
  function EventCloneFactory(this: any, overProps) {
    Object.keys(overProps).forEach(key => {
      this[key] = overProps[key]
    })
  }
  EventCloneFactory.prototype = eventObj

  return new EventCloneFactory(overrideObj)
}

const EventProxy = {
  isMobile: isMobile(),
  eventPool: new Map(),
  getEventName(name): { eventName: keyof HTMLElementEventMap; handler: EventListener } {
    const _event = (this.isMobile ? MobileEvents[name] : PCEvents[name]) || {}
    return _event
  },
  on(target: HTMLElement, eventType: string, callback: EventListener) {
    const { eventName, handler } = this.getEventName(eventType)
    if (!eventName) return
    const _handler = handler.bind(null, callback)
    target.addEventListener(eventName, _handler)
    let eventObject = this.eventPool.get(target)
    if (!eventObject) {
      const m = new Map([callback, _handler])
      eventObject = { [eventName]: m }
      this.eventPool.set(target, eventObject)
    }
    if (!eventObject[eventName]) {
      eventObject[eventName] = new Map([callback, _handler])
    }
    eventObject[eventName].set(callback, _handler)
    return this
  },
  off(target: HTMLElement, eventType: string, callback?: EventListener) {
    const { eventName } = this.getEventName(eventType)
    if (!eventName) return
    const eventObject = this.eventPool.get(target)
    if (eventObject && eventObject[eventName]) {
      const eventMap: Map<Function, EventListener> = eventObject[eventName]
      if (!callback) {
        Array.from(eventMap.values()).forEach(_handler => {
          target.removeEventListener(eventName, _handler)
        })
        eventMap.clear()
      } else {
        const _handler = eventMap.get(callback)
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
