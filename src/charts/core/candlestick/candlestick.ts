import BasePanel from '../basePanel';
import { PanelOptions, CandlestickItem, Point, AxisData, CandlestickBar, Trend } from '../../typeof/type';
import CandlestickWidget from '../widgets/candlestick-widget';
import { createCanvasElement, geElementOffsetFromParent, formatTimeStr, setElementStyle } from '../../util/helper';
import IWidget from '../widgets/iWidget';
import { abs } from '../../util/math';
import Axis from '../../model/axis';

export default class Candlestick extends BasePanel {
  public config = { marginLeft: 0, marginRight: 60, marginBottom: 30, marginTop: 0, showCrossLine: true };
  constructor(options: PanelOptions) {
    super(options);
    const container = this.options.container;
    if (container) {
      this.setAttrs({width: container.clientWidth, height: container.clientHeight});
    }
    this.initContainer();
    this.setAxis();
    this.initEvents();
    const candlewWidget = new CandlestickWidget();
    this.addWidget(candlewWidget);
  }
  public getYExtent(): number[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>();
    const values: number[] = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
      acc.push(...[cur.high, cur.low]);
      return acc;
    }, []);
    return [Math.min(...values), Math.max(...values)];
  }
  public getTimeExtent(): number[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>();
    const values: number[] = visibleData.map((rowData: CandlestickItem) => {
      const timeStr = formatTimeStr(`${rowData.time}`);
      return new Date(timeStr).getTime();
    });
    return [Math.min(...values), Math.max(...values)];
  }
  public setAxis() {
    const { marginLeft, marginRight, marginBottom, marginTop, width, height } = this.getConfig();
    const viewBoundSize = { width: width - marginLeft - marginRight, height: height - marginTop - marginBottom };
    const yExtent = this.getYExtent();
    this._yAxis = new Axis([0, 0], yExtent, [0, viewBoundSize.height]);
    const xExtent = this.getTimeExtent();
    this._xAxis = new Axis([0, 0], xExtent, [0, viewBoundSize.width]);
  }
  public getAxisData(): AxisData {
    const yAxisData = this._yAxis.getAxisData();
    const xAxisData = this._xAxis.getAxisData();
    return { xAxisData, yAxisData };
  }
  public getPositonByValue(xValue: number, yValue: number): Point {
    const x = this._xAxis.getCoordOfValue(xValue);
    const y = this._yAxis.getCoordOfValue(yValue);
    return { x, y };
  }
  public getVisibleBars(): CandlestickBar[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>();
    return visibleData.map((item: CandlestickItem) => {
      const timestamp = new Date(formatTimeStr(item.time as string)).getTime();
      const low = this.getPositonByValue(timestamp, item.low);
      const high = this.getPositonByValue(timestamp, item.high);
      return {
        ...low,
        ...item,
        width: this._xAxis.ratio,
        height: abs(high.y - low.y),
        type: item.close - item.open > 0 ? Trend.Up : Trend.Down
      }
    });
  }
  public initContainer() {
    const { width = 0, height = 0 } = this.getConfig();
    this.setCanvas(createCanvasElement(width, height));
    this.setCacheCanvas(createCanvasElement(width, height, { style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: -1}}))
    this.addElement(this.getCanvas());
    this.addElement(this.getCacheCanvas());
  }
  private initEvents() {
    const canvas = this.getCanvas();
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
      setElementStyle(this.getCanvas(), { cursor: 'default'});
    }
  } 
}