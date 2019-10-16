import React from 'react';
import { CommonContextProps } from '../typeof/type';
import './candlestick.css';

const Candlestick: React.FC = (props: CommonContextProps) =>{
  return (
    <div 
      className={`candlestick-wrap ${props.className}`}
      style={props.style}
    >
      <div className="view-wrap">
        <canvas className="canvas-default" />
      </div>
      {props.children}
    </div>
  )
}

export default Candlestick;