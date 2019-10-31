import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { CommonObject, CommonContextProps } from './typeof/type';
import CandlestickPanel from './core/candlestick/candlestick';

const propsToSkip: {[k: string]: boolean} = {
  children: true,
  className: true,
  ref: true,
  key: true,
  style: true,
  forwardedRef: true,
  unstable_applyCache: true,
  unstable_applyDrawHitFromCache: true
};

function applyNodeProps(instance: CandlestickPanel, props: CommonObject) {
  const oldProps = instance.getConfig();
  for (const key in oldProps) {
    if (propsToSkip[key]) {
      continue;
    }
    const isEvent = key.slice(0, 2) === 'on';
    const propChanged = oldProps[key] !== props[key];
    if (isEvent && propChanged) {
      const eventName = key.substr(2).toLowerCase();
      instance.off(eventName, oldProps[key]);
    }
    // const toRemove = !props.hasOwnProperty(key);
    // if (toRemove) {
    //   instance.setAttr(key, undefined);
    // }
  }
  const updatedProps: CommonObject = {};
  let hasUpdates = false;
  for (const key in props) {
    if (propsToSkip[key]) continue;
    const isEvent = key.slice(0, 2) === 'on';
    const toAdd = oldProps[key] !== props[key];
    if (isEvent && toAdd) {
      const eventName = key.substr(2).toLowerCase();
      if (props[key]) {
        instance.on(eventName, props[key]);
      }
    }
    if (!isEvent && (props[key] !== oldProps[key] || props[key] !== instance.getAttr(key))) {
      hasUpdates = true;
      updatedProps[key] = props[key];
    }
  }
  if (hasUpdates) {
    instance.setAttrs(updatedProps);
    instance.update();
  }
}
const Candlestick: React.FC = (props: CommonContextProps, ref) => {
  const containerRef = useRef(null)
  const candlestickRef = useRef<CandlestickPanel>()
  useImperativeHandle(ref, () => ({
    getCandlestick: () => candlestickRef.current,
  }))
  useEffect(() => {
    if (!candlestickRef.current) {
      candlestickRef.current = new CandlestickPanel({
        container: containerRef.current as any,
      })
    }
    applyNodeProps(candlestickRef.current, props)
  })
  return (
    <div
      ref={containerRef}
      className={props.className}
      style={props.style}
    />
  )
}

export default forwardRef(Candlestick);