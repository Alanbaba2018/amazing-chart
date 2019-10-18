import React from 'react';
import './App.css';
import Candlestick from './charts/candlestick';

export default function App()  {
  const startDate = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const seriesData = Array(50).fill(0).map((i, index) => {
    return {
      time: startDate + index * oneDay,
      open: 7000 + (Math.random() - 0.5) * 800,
      high: 7000 + (Math.random() + 0.5) * 100,
      low: 7000 + (Math.random() - 0.5) * 100,
      close: 7000 + (Math.random() - 0.5) * 800
    }
  });
  function mousemove(e: any) {
    console.log(e)
  }
  const props = {
    className: "candlestick-chart",
    seriesData: seriesData,
    marginRight: 60,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 40,
    onmousemove: mousemove
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