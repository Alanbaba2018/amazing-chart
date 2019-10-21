import BasePanel from '../basePanel';
import { PanelOptions, CandlestickItem, Point, AxisData, CandlestickBar, Trend } from '../../typeof/type';
import { DevicePixelRatio, TextBaseLine, TextAlign } from '../../typeof/const';
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
import TimeAxis from '../../model/time-axis';

export default class Candlestick extends BasePanel {
  public config = { 
    marginLeft: 0, 
    marginRight: 60, 
    marginBottom: 30, 
    marginTop: 0, 
    background: '#000000', 
    showCrossLine: true,
    xAxis: {
      textBaseline: TextBaseLine.Top, 
      textAlign: TextAlign.Center, 
      strokeStyle: '#f0f6f9', 
      fillStyle: '#f0f6f9',
    },
    yAxis: {
      textBaseline: TextBaseLine.Middle, 
      textAlign: TextAlign.Left, 
      strokeStyle: '#f0f6f9', 
      fillStyle: '#f0f6f9',
    },
    grid: {
      strokeStyle: '#242424',
      lineWidth: 1
    },
    crossLine: {
      strokeStyle: '#ffffff',
      background: '#2d2d2d',
      xLabelColor: '#ffffff',
      yLabelColor: '#ffffff'
    },
    candlestick: {
      [Trend.Up]: {
        fillColor: '#ff0372',
        strokeStyle: '#ff0372'
      },
      [Trend.Down]: {
        fillColor: '#00c582',
        strokeStyle: '#00c582'
      }
    }
  };
  constructor(options: PanelOptions) {
    super(options);
    this.initContainer();
    this.initWidgets();
    this.initEvents();
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
    const values: number[] = visibleData.map((rowData: CandlestickItem) => getTimestamp(rowData.time));
    return [Math.min(...values), Math.max(...values)];
  }
  public setAxis() {
    const { marginLeft, marginRight, marginBottom, marginTop, width, height } = this.getConfig();
    const viewBoundSize = { width: width - marginLeft - marginRight, height: height - marginTop - marginBottom };
    const yExtent = this.getYExtent();
    this._yAxis = new Axis(yExtent, [0, viewBoundSize.height]);
    const xExtent = this.getTimeExtent();
    this._xAxis = new TimeAxis(xExtent, [0, viewBoundSize.width], this.getVisibleSeriesData<CandlestickItem[]>().length);
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
      const open = this.getPositonByValue(timestamp, item.open);
      const close = this.getPositonByValue(timestamp, item.close);
      return {
        ...item,
        x: low.x,
        y: Math.min(open.y, close.y),
        time: timestamp,
        width: this._xAxis.unitWidth,
        height: abs(close.y - open.y),
        openY: open.y,
        closeY: close.y,
        highY: high.y,
        lowY: low.y,
        type: item.close - item.open > 0 ? Trend.Up : Trend.Down
      }
    });
  }
  public initContainer() {
    const container = this.options.container;
    if (container) {
      this.setAttrs({width: container.clientWidth, height: container.clientHeight});
    }
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
    this.setAxisCanvas(createCanvasElement(width, height, { 
      className: 'axis-canvas',
      style: { 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: `${width}px`, 
        height: `${height}px`, 
        zIndex: 0
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
    this.addElement(this.getBgCanvas());
    this.addElement(this.getCanvas());
    this.addElement(this.getAxisCanvas());
    this.addElement(this.getHitCanvas());
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
  public updateContainerSize() {
    const hitCanvas = this.getHitCanvas();
    const sceneCanvas = this.getCanvas();
    const bgCanvas = this.getBgCanvas();
    const { width, height } = this.getConfig();
    this.setAttrs({ width, height });
    const styles = { width: `${width}px`, height: `${height}px` };
    [hitCanvas, sceneCanvas, bgCanvas].forEach((canvas: HTMLCanvasElement) => {
      canvas.width = width * DevicePixelRatio;
      canvas.height = height * DevicePixelRatio;
      setElementStyle(canvas, styles);
    });
    this.setAxis();
  }
  private initEvents() {
    const canvas = this.getHitCanvas();
    canvas.addEventListener('mousemove', this.onmousemove.bind(this));
    canvas.addEventListener('wheel', this.onmousewheel.bind(this));
  }
  private onmousemove(e: MouseEvent) {
    const point: Point = geElementOffsetFromParent(e);
    let isMoveToWidget: boolean = false;
    this.eachWidgets((widget: IWidget) => {
      const isContain = widget.contain(point);
      if (isContain) {
        isMoveToWidget = true;
        if (!widget.getIsMouseOvered()) {
          widget.fire('mouseover');
        }
        widget.setIsMouseOvered(true);
        widget.fire('mousemove', { point });
      } else if (widget.getIsMouseOvered()) {
        widget.fire('mouseout');
      }
    });
    if (!isMoveToWidget) {
      setElementStyle(this.getHitCanvas(), { cursor: 'default'});
    }
  }
  private onmousewheel(e: MouseWheelEvent) {
    const point: Point = geElementOffsetFromParent(e);
    this.eachWidgets((widget: IWidget) => {
      if (widget.contain(point)) {
        widget.fire('mousewheel', { originEvent: e, point });
      }
    });
  }
}