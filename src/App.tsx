import React, { useRef } from 'react';
import './App.css';
import Candlestick from './charts1/candlestick';
import candlestickJson from './data.json';

export default function App() {
  const seriesData = candlestickJson.map((item: any, index: number) => {
    return {
      ...item,
      time: 1569859200000 + index * 60 * 1000 * 30,
    }
  });
  const ref = useRef();
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    ref
  };
  return (
    <div className="App">
      <Candlestick
        {...props}
      >
      </Candlestick>
    </div>
  );
}