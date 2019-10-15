import React from 'react';
import './App.css';
import { Candlestick, PriceAxis, TimeAxis } from './charts/index';

import { CommonContextProps } from './charts/typeof/type';
interface StateConfig {
  tickNumber: number
}
class App extends React.PureComponent<CommonContextProps, StateConfig> {
  constructor(props: CommonContextProps) {
    super(props);
    this.state = {
      tickNumber: 8
    };
    this.clickHeader = this.clickHeader.bind(this);
  }
  clickHeader() {
    this.setState({
      tickNumber: this.state.tickNumber - 1
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header" onClick={this.clickHeader} />
        <Candlestick className="app-body">
          <PriceAxis tickNumber={this.state.tickNumber} className="price-axis" />
          <TimeAxis />
        </Candlestick>
      </div>
    );
  }
}

export default App;
