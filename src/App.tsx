import React, { useRef, useEffect } from 'react';
import './App.css';
import Candlestick from './charts1/candlestick';
import candlestickJson from './data.json';
import { IndicatorType } from './charts1/typeof/type';

export default function App() {
  let current = Date.now()
  current -= current % (60 * 1000 * 60)
  const len = candlestickJson.length - 1
  const seriesData = candlestickJson.map((item: any, index: number) => {
    return {
      ...item,
      time: current - (len - index) * 60 * 1000 * 60,
    }
  });
  const ref = useRef();
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    indicators: [{
      type: IndicatorType.VOL,
    }, {
      type: IndicatorType.BOLL,
      params: {
        period: 20,
        stdDev: 2,
        colors: ['#b2b2b2', '#596a83', '#596a83']
      }
    }],
    ref
  };
  useEffect(() => {
    const instance = ref.current as any
    const candlestick = instance.getCandlestick()
    console.log(candlestick)
    // const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=bnbusdt@kline_1m')
    // socket.onopen = () => {
    //   console.log('sokect conneted.....')
    // }
    // socket.onmessage = evt => {
    //   const item = JSON.parse(evt.data)
    //   candlestick.addOrUpdateLastData(item.data.k)
    // }
    const handleOrientationChange = () => {
      setTimeout(() => {
        candlestick.resize()
      }, 60)
    }
    const screenDirection = window.matchMedia('(orientation: portrait)')
    screenDirection.addListener(handleOrientationChange)
    return () => {
      screenDirection.removeListener(handleOrientationChange)
    }
  })
  return (
    <div className="App">
      <Candlestick
        {...props}
      >
      </Candlestick>
    </div>
  );
}