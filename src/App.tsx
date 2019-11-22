import React, { useRef, useEffect } from 'react';
import './App.css';
import Candlestick from './charts1/candlestick';
import candlestickJson from './data.json';
import { IndicatorType } from './charts1/typeof/type';

export default function App() {
  let current = Date.now()
  current -= current % (60 * 1000)
  const len = candlestickJson.length - 1
  const seriesData = candlestickJson.map((item: any, index: number) => {
    return {
      ...item,
      time: current - (len - index) * 60 * 1000,
    }
  });
  const ref = useRef();
  // @ts-ignore
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    // indicators: [{
    //   type: IndicatorType.VOL,
    //   params: {},
    // }, {
    //   type: IndicatorType.BOLL,
    //   params: {
    //     period: 20,
    //     stdDev: 2,
    //     colors: ['#b2b2b2', '#596a83', '#596a83']
    //   }
    // }],
    ref
  };
  useEffect(() => {
    const instance = ref.current as any
    const candlestick = instance.getCandlestick()
    candlestick.addIndicatorPanelByName(IndicatorType.VOL, {})
    console.log(candlestick)
    const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=bnbusdt@kline_1m')
    socket.onopen = () => {
      console.log('sokect conneted.....')
    }
    socket.onmessage = evt => {
      const { data: { k: data } } = JSON.parse(evt.data)
      const item = { time: data.t, open: data.o, high: data.h, low: data.l, close: data.c, volume: data.v }
      candlestick.addOrUpdateLastData(item)
    }
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
    // @ts-ignore
    <div className="App">
      <Candlestick
        {...props}
      >
      </Candlestick>
    </div>
  );
}