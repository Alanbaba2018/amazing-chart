import * as Nodes from './core/index';
import React from 'react';
import { CommonObject } from './typeof/type';
import ChartRenderer from './react-reconciler/chartRenderer';
import { applyNodeProps } from './react-reconciler/propsUpdate';
import { FiberRoot } from 'react-reconciler';

function createPanel(panelType: string) {
  // return function ChartPanel(props: CommonObject) {
  //   let _tagRef: any = null;
  //   useEffect(() => {
  //     const _chart = new (Nodes as any)[panelType]({
  //       width: 800,
  //       height: 400,
  //       container: _tagRef
  //     });
  //     applyNodeProps(_chart, props);
  //     const _mountNode = ChartRenderer.createContainer(_chart, false, false);
  //     ChartRenderer.updateContainer(props.children, _mountNode, , );
  //     return function destroy() {
  //       _chart.destroy();
  //     }
  //   });
  //   return (
  //     <div
  //       ref={ref => (_tagRef = ref)}
  //       className={props.className}
  //       style={props.style}
  //     ></div>
  //   )
  // }
  return class ChartPanel extends React.Component<CommonObject> {
    public _chart!: any;
    public _tagRef: any;
    public _mountNode!: FiberRoot;
    componentDidMount() {
      this._chart = new (Nodes as any)[panelType]({
        width: this.props.width || this._tagRef.clientWidth,
        height: this.props.height || this._tagRef.clientHeight,
        container: this._tagRef
      });
      this._setRef(this._chart);

      applyNodeProps(this._chart, this.props);
      this._mountNode = ChartRenderer.createContainer(this._chart, false, false);
      ChartRenderer.updateContainer(this.props.children, this._mountNode, this as any, () => void 0);
    }

    _setRef(value: any) {
      const { forwardedRef } = this.props;
      if (!forwardedRef) {
        return;
      }
      if (typeof forwardedRef === 'function') {
        forwardedRef(value);
      } else {
        forwardedRef.current = value;
      }
    }

    componentDidUpdate(prevProps: CommonObject) {
      this._setRef(this._chart);
      applyNodeProps(this._chart, this.props, prevProps);

      ChartRenderer.updateContainer(this.props.children, this._mountNode, this as any, () => { });
    }

    componentWillUnmount() {
      this._setRef(null);
      ChartRenderer.updateContainer(null, this._mountNode, this as any, () => { });
      this._chart.destroy();
    }

    getChart() {
      return this._chart;
    }

    render() {
      const props = this.props;
      return (
        <div
          ref={ref => (this._tagRef = ref)}
          className={props.className}
          style={props.style}
        />
      );
    }
  }
}

const chartWrapperList: string[] = ['Candlestick'];
const Types: { [k: string]: any } = {};
for (const key in Nodes) {
  if (chartWrapperList.indexOf(key) > -1) {
    Types[key] = createPanel(key);
  } else {
    Types[key] = key;
  }
}

export const Candlestick = Types['Candlestick'];
export const PriceAxis = Types['PriceAxis'];
export const TimeAxis = Types['TimeAxis'];
export const CandlestickGrid = Types['CandlestickGrid'];