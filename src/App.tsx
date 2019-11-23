import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import Candlestick from './charts1/candlestick';
// import candlestickJson from './data.json';
import { IndicatorType } from './charts1/typeof/type';

function proxyUrl(url) {
  return `http://localhost:8080/proxy?url=${encodeURIComponent(url)}`
}
function useKlineData(symbol: string, interval: string) {
  const [data, setData] = useState([])
  useEffect(() => {
    const baseUrl = `https://www.binance.com/api/v1/klines?symbol=${symbol}&interval=${interval}`
    fetch(proxyUrl(baseUrl)).then(response => {
      response.json().then(data => {
        const _data = data.map(([time, open, high, low, close, volume]) => {
          return { time, open, high, low, close, volume }
        })
        setData(_data)
      })
    })

  }, [symbol, interval])
  return data
}

function useLastData(symbol: string) {
  const [lastData, setLastData] = useState({})
  useEffect(() => {
    const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=bnbusdt@kline_1m')
    socket.onopen = () => {
      console.log('sokect conneted.....')
    }
    socket.onmessage = evt => {
      const { data: { k: data } } = JSON.parse(evt.data)
      const item = { time: data.t, open: data.o, high: data.h, low: data.l, close: data.c, volume: data.v }
      setLastData(item)
    }
  }, [symbol])
  return lastData
}

export default function App() {
  const seriesData = useKlineData('BNBUSDT', '1m')
  const ref = useRef();
  const lastData = useLastData('BNBUSDT')
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    indicators: [{
      type: IndicatorType.VOL,
      indicatorType: IndicatorType.VOL,
      params: {},
      subElement: document.createElement('div')
    }],
    ref
  };
  useEffect(() => {
    const instance = ref.current as any
    const candlestick = instance.getCandlestick()
    console.log(candlestick)
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
  }, [seriesData])
  useEffect(() => {
    const instance = ref.current as any
    const candlestick = instance.getCandlestick()
    candlestick.addOrUpdateLastData(lastData)
  }, [lastData])
  return (
    <div className="App">
      <Candlestick
        {...props}
      >
      </Candlestick>
    </div>
  );
}