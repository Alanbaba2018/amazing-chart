import React from 'react';
import { CommonContextProps } from '../typeof/type';

interface ContextProps extends CommonContextProps {
  tickNumber?: number
}
export default class Grid extends React.PureComponent<ContextProps> {
  constructor(props: ContextProps) {
    super(props);
  }
  componentDidMount() {
    console.log('grid render did');
  }
  componentWillUpdate(newProps: ContextProps) {
    console.log('update', this.props.tickNumber, newProps.tickNumber);
  }
  render() {
    return null;
  }
}