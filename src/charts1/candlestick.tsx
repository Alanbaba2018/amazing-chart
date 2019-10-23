import React, { useEffect } from 'react'
import { CommonObject, CommonContextProps } from './typeof/type'
import CandlestickPanel from './core/candlestick'

const propsToSkip: { [k: string]: boolean } = {
  children: true,
  className: true,
  ref: true,
  key: true,
  style: true,
  forwardedRef: true,
  unstable_applyCache: true,
  unstable_applyDrawHitFromCache: true,
}

const applyNodeProps = (instance: CandlestickPanel, props: CommonObject) => {
  const oldProps = instance.getConfig()
  Object.keys(oldProps).forEach(key => {
    if (propsToSkip[key]) return
    const isEvent = key.slice(0, 2) === 'on'
    const propChanged = oldProps[key] !== props[key]
    if (isEvent && propChanged) {
      const eventName = key.substr(2).toLowerCase()
      instance.off(eventName, oldProps[key])
    }
    // const toRemove = !props.hasOwnProperty(key);
    // if (toRemove) {
    //   instance.setAttr(key, undefined);
    // }
  })
  const updatedProps: CommonObject = {}
  let hasUpdates = false
  Object.keys(props).forEach(key => {
    if (propsToSkip[key]) return
    const isEvent = key.slice(0, 2) === 'on'
    const toAdd = oldProps[key] !== props[key]
    if (isEvent && toAdd) {
      const eventName = key.substr(2).toLowerCase()
      if (props[key]) {
        instance.on(eventName, props[key])
      }
    }
    if (!isEvent && (props[key] !== oldProps[key] || props[key] !== instance.getAttr(key))) {
      hasUpdates = true
      updatedProps[key] = props[key]
    }
  })
  if (hasUpdates) {
    instance.setAttrs(updatedProps)
    instance.update()
  }
}
const Candlestick = (props: CommonContextProps) => {
  let tagRef!: HTMLElement
  useEffect(() => {
    const candlestickPanel = new CandlestickPanel({
      container: tagRef,
    })
    applyNodeProps(candlestickPanel, props)
  })
  return <div
    ref={ref => (tagRef = ref as HTMLElement)}
    className={props.className}
    style={props.style}
  />
}

export default Candlestick
