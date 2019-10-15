import React from 'react';
import { CommonContextProps } from '../typeof/type';

export default class BaseChart extends React.PureComponent<CommonContextProps> {
  public tagRef: any;
  constructor(props: CommonContextProps) {
    super(props);
  }
  componentDidMount() {
    console.log(this.props.children);
  }
  render() {
    return (
      <div 
        ref={ref => (this.tagRef = ref)}
        className={this.props.className}
        style={this.props.style}
      >{this.props.children}</div>
    )
  }
}