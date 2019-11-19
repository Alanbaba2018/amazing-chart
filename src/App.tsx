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
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    indicators: [{
      type: IndicatorType.VOL,
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
      console.log(window.innerWidth, window.innerHeight)
      setTimeout(() => {
        console.log(window.innerWidth, window.innerHeight)
        candlestick.resize()
      }, 2000)
    }
    const screenDirection = window.matchMedia('(orientation: portrait)')
    screenDirection.addListener(handleOrientationChange)
    // const rotate = () => {
    //   candlestick.resize()
    //   setTimeout(() => {

    //   })
    //   console.log(window.innerWidth, window.innerHeight)
    // }
    // window.addEventListener('orientationchange', rotate)
    return () => {
      // window.removeEventListener('orientationchange', rotate)
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