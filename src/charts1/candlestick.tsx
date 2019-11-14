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
  'indicators',
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
const Candlestick = forwardRef((props: CommonContextProps, ref) => {
  const containerRef = useRef(null)
  const candlestickRef = useRef<CandlestickPanel>()
  useImperativeHandle(ref, () => ({
    getCandlestick: () => candlestickRef.current,
  }))
  useEffect(() => {
    if (!candlestickRef.current) {
      const validProps = {}
      propsToUpdate.forEach(key => {
        if (props[key] !== undefined) {
          validProps[key] = props[key]
        }
      })
      candlestickRef.current = new CandlestickPanel({
        container: containerRef.current as any,
        ...validProps,
      })
      candlestickRef.current.update()
    } else {
      applyNodeProps(candlestickRef.current, props)
    }
  })
  return <div ref={containerRef} className={props.className} style={props.style} />
})

export default Candlestick
