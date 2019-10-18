import BasePanel from '../basePanel';
import { PanelOptions, CandlestickItem, Point, AxisData, CandlestickBar, Trend } from '../../typeof/type';
import CandlestickWidget from '../widgets/candlestick-widget';
import CandlestickGridWidget from '../widgets/candlestick-grid-widget';
import PriceAxisWidget from '../widgets/price-axis-widget';
import TimeAxisWidget from '../widgets/time-axis-widget';
import { 
  createCanvasElement, 
  geElementOffsetFromParent, 
  setElementStyle,
  getTimestamp
} from '../../util/helper';
import IWidget from '../widgets/iWidget';
import { abs } from '../../util/math';
import Axis from '../../model/axis';

export default class Candlestick extends BasePanel {
  public config = { marginLeft: 0, marginRight: 60, marginBottom: 30, marginTop: 0, background: '#000000', showCrossLine: true };
  constructor(options: PanelOptions) {
    super(options);
    const container = this.options.container;
    if (container) {
      this.setAttrs({width: container.clientWidth, height: container.clientHeight});
    }
    this.initContainer();
    this.initWidgets();
    this.initEvents();
  }
  public getYExtent(): number[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>();
    const values: number[] = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
      acc.push(...[cur.high, cur.low, cur.open, cur.close]);
      return acc;
    }, []);
    return [Math.min(...values), Math.max(...values)];
  }
  public getTimeExtent(): number[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>();
    const values: number[] = visibleData.map((rowData: CandlestickItem) => getTimestamp(rowData.time));
    return [Math.min(...values), Math.max(...values)];
  }
  public setAxis() {
    const { marginLeft, marginRight, marginBottom, marginTop, width, height } = this.getConfig();
    const viewBoundSize = { width: width - marginLeft - marginRight, height: height - marginTop - marginBottom };
    const yExtent = this.getYExtent();
    this._yAxis = new Axis(yExtent, [0, viewBoundSize.height]);
    const xExtent = this.getTimeExtent();
    this._xAxis = new Axis(xExtent, [0, viewBoundSize.width], 10, true);
  }
  public getAxisData(): AxisData {
    if (!this._xAxis || !this._yAxis) {
      this.setAxis();
    }
    const yAxisData = this._yAxis.getAxisData();
    const xAxisData = this._xAxis.getAxisData();
    return { xAxisData, yAxisData };
  }
  public getPositonByValue(xValue: number, yValue: number): Point {
    if (!this._xAxis || !this._yAxis) {
      this.setAxis();
    }
    const x = this._xAxis.getCoordOfValue(xValue);
    const y = this._yAxis.getCoordOfValue(yValue);
    return { x, y };
  }
  public getVisibleBars(): CandlestickBar[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>();
    return visibleData.map((item: CandlestickItem) => {
      const timestamp = getTimestamp(item.time as string);
      const low = this.getPositonByValue(timestamp, item.low);
      const high = this.getPositonByValue(timestamp, item.high);
      return {
        ...low,
        ...item,
        time: timestamp,
        width: 30,
        height: abs(high.y - low.y),
        type: item.close - item.open > 0 ? Trend.Up : Trend.Down
      }
    });
  }
  public initContainer() {
    const { width = 0, height = 0 } = this.getConfig();
    this.seHitCanvas(createCanvasElement(width, height, { 
      className: 'hit-canvas',
      style: { 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: `${width}px`, 
        height: `${height}px`, 
        zIndex: 1
      }
    }));
    this.setCanvas(createCanvasElement(width, height, { 
      className: 'scene-canvas',
      style: { 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: `${width}px`, 
        height: `${height}px`, 
        zIndex: -1
      }
    }));
    this.setBgCanvas(createCanvasElement(width, height, { 
      className: 'bg-canvas', 
      style: { 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: `${width}px`, 
        height: `${height}px`, 
        zIndex: -2
      }
    }));
    this.addElement(this.getCanvas());
    this.addElement(this.getHitCanvas());
    this.addElement(this.getBgCanvas());
    const { background = 'transparent' } = this.getConfig();
    this.setPanelBackground(background);
  }
  public initWidgets() {
    const candlewWidget = new CandlestickWidget();
    const candlestickGridWidget = new CandlestickGridWidget();
    const priceAxisWidget = new PriceAxisWidget();
    const timeAxisWidget = new TimeAxisWidget();
    this.addWidgets([candlewWidget, candlestickGridWidget, priceAxisWidget, timeAxisWidget]);
  }
  private initEvents() {
    const canvas = this.getHitCanvas();
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  private onMouseMove(e: MouseEvent) {
    const point: Point = geElementOffsetFromParent(e);
    let isMoveToWidget: boolean = false;
    this.eachWidgets((widget: IWidget) => {
      if (widget.contain(point)) {
        isMoveToWidget = true;
        widget.onMousemove(point);
      }
    });
    if (!isMoveToWidget) {
      setElementStyle(this.getHitCanvas(), { cursor: 'default'});
    }
  } 
}