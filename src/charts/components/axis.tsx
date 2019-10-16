import React, {useEffect} from 'react';
import { CommonContextProps } from '../typeof/type';

interface ContextProps extends CommonContextProps {
  tickNumber?: number
}

const PriceAxis = (props: ContextProps) => {
  useEffect(() => {
    
  });
  return (
    <div className={`axis-wrap ${props.className || ''}`} style={props.style}>
      <canvas className="canvas-default" />
    </div>
  );
}
export default PriceAxis