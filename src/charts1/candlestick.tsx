import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import {
  CommonObject,
  CandlestickItem,
  Margin,
  xAxisConfig,
  yAxisConfig,
  TimelineConfig,
  IndicatorView,
  CommonContextProps,
} from './typeof/type'
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
interface CandlestickProps extends CommonContextProps {
  seriesData?: CandlestickItem[]
  margin?: Margin
  background?: string
  xAxis?: xAxisConfig
  yAxis?: yAxisConfig
  crossHair?: any
  candlestick?: any
  timeline?: TimelineConfig
  indicators?: IndicatorView[]
}

const applyNodeProps = (instance: CandlestickPanel, props: CandlestickProps) => {
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
const Candlestick = forwardRef((props: CandlestickProps, ref) => {
  const containerRef = useRef(null)
  const candlestickRef = useRef<CandlestickPanel>()
  const { seriesData, margin, background, xAxis, yAxis, crossHair, candlestick, timeline, indicators } = props
  useImperativeHandle(ref, () => ({
    getCandlestick: () => candlestickRef.current,
  }))
  useEffect(() => {
    if (!candlestickRef.current) {
      const validProps: CommonObject = {}
      propsToUpdate.forEach(key => {
        if (props[key] !== undefined) {
          validProps[key] = props[key]
        }
      })
      candlestickRef.current = new CandlestickPanel({
        container: containerRef.current as any,
        ...validProps,
      })
      if (validProps.seriesData && validProps.seriesData.length > 0) {
        candlestickRef.current.update()
      }
    } else {
      applyNodeProps(candlestickRef.current, props)
    }
  }, [seriesData, margin, background, xAxis, yAxis, crossHair, candlestick, timeline, indicators, props])
  return <div ref={containerRef} className={props.className} style={{...{width: '100%', height: '100%', position: 'relative'}, ...props.style}} />
})

export default Candlestick
