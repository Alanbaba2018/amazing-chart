import React from 'react';
import './App.css';
import Candlestick from './charts1/index';
import candlestickJson from './data.json';

export default function App() {
  const seriesData = candlestickJson.map((item: any) => {
    const [time, open, high, low, close] = item;
    return {
      time,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close)
    }
  });
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    marginRight: 60,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 30,
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