import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { CommonObject, CommonContextProps } from './typeof/type'
import CandlestickPanel from './core/candlestick'

const propsToUpdate: string[] = [
  'seriesData',
  'margin',
  'background',
  'xAxis',
  'yAxis',
  'grid',
  'crossHair',
  'candlestick',
  'timeline',
  'extends',
]

const applyNodeProps = (instance: CandlestickPanel, props: CommonObject) => {
  const oldProps = instance.getConfig()
  const updatedProps: CommonObject = {}
  let hasUpdates = false
  Object.keys(props).forEach(key => {
    if (propsToUpdate.includes(key) && props[key] !== oldProps[key]) {
      hasUpdates = true
      updatedProps[key] = props[key]
    }
  })
  if (hasUpdates) {
    instance.setAttrs(updatedProps)
    instance.update()
  }
}
const Candlestick = (props: CommonContextProps, ref) => {
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
      applyNodeProps(candlestickRef.current, props)
    }
  })
  return <div ref={containerRef} className={props.className} style={props.style} />
}

export default forwardRef(Candlestick)
