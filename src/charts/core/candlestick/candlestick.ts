import BasePanel from '../basePanel';
import { PanelOptions, CandlestickItem, Point, AxisData, CandlestickBar, Trend } from '../../typeof/type';
import { DevicePixelRatio, TextBaseLine, TextAlign, CommonKeys } from '../../typeof/const';
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
      tickWidth: 5,
      textMargin: 5,
      scaleRatio: 0.05,
    },
    yAxis: {
      textBaseline: TextBaseLine.Middle, 
      textAlign: TextAlign.Left, 
      strokeStyle: '#f0f6f9', 
      fillStyle: '#f0f6f9',
      tickWidth: 5,
      textMargin: 5,
      scaleRatio: 0.04,
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
        fillStyle: '#940505',
        strokeStyle: '#c60606',
        lineWidth: 1
      },
      [Trend.Down]: {
        fillStyle: '#00c582',
        strokeStyle: '#00c582',
        lineWidth: 1
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
    const xExtent = this.getTimeExtent();
    this._xAxis = new TimeAxis(xExtent, [0, viewBoundSize.width], this.getVisibleSeriesData<CandlestickItem[]>().length);
    this.setVisibleSeriesData();
    const yExtent = this.getYExtent();
    this._yAxis = new Axis(yExtent, [0, viewBoundSize.height]);
  }
  public setVisibleSeriesData() {
    const visibleData = this.getSeriesData().filter((item: CandlestickItem) => this._xAxis.domainRange.contain(item.time as number));
    this.setAttr('visibleSeriesData', visibleData);
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
        width: this._xAxis.unitWidth / 2.5,
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
    const style = { position: 'absolute', left: 0, top: 0, width: `${width}px`, height: `${height}px` };
    this.seHitCanvas(createCanvasElement(width, height, { 
      className: 'hit-canvas',
      style: { ...style, zIndex: 1 }
    }));
    this.setAxisCanvas(createCanvasElement(width, height, { 
      className: 'axis-canvas',
      style: { ...style, zIndex: 0 }
    }));
    this.setCanvas(createCanvasElement(width, height, { 
      className: 'scene-canvas',
      style: { ...style, zIndex: -1 }
    }));
    this.setBgCanvas(createCanvasElement(width, height, { 
      className: 'bg-canvas', 
      style: { ...style, zIndex: -2}
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
    const axisCanvas = this.getAxisCanvas();
    const { width, height } = this.getConfig();
    this.setAttrs({ width, height });
    const styles = { width: `${width}px`, height: `${height}px` };
    [hitCanvas, sceneCanvas, bgCanvas, axisCanvas].forEach((canvas: HTMLCanvasElement) => {
      canvas.width = width * DevicePixelRatio;
      canvas.height = height * DevicePixelRatio;
      setElementStyle(canvas, styles);
    });
    this.setAxis();
  }
  public shiftTimeLine(px: number) {
    const timeAxis = this.getXAxis() as TimeAxis;
    const shiftTime = px / timeAxis.unitWidth * timeAxis.getUnitTimeValue();
    timeAxis.domainRange.shift(shiftTime);
    this.setVisibleSeriesData();
    this.updateYExtend();
    this.update();
  }
  public updateTimeExtent() {
    this.setVisibleSeriesData();
    this.updateYExtend();
    this.update();
  }
  public updateYExtend() {
    const yExtent = this.getYExtent();
    const newCenter = (yExtent[0] + yExtent[1]) / 2;
    const halfInterval = (yExtent[1] - yExtent[0]) / 2;
    const scaleCoeff = this._yAxis.getScaleCoeff();
    this._yAxis.domainRange.setMinValue(newCenter - halfInterval * scaleCoeff)
      .setMaxValue(newCenter + halfInterval * scaleCoeff);
  }
  private initEvents() {
    this.on(`seriesData${CommonKeys.Change}`, () => {
      this.setAxis();
    });
    const canvas = this.getHitCanvas();
    canvas.addEventListener('mousedown', this.eventHandler.bind(this, 'mousedown'));
    canvas.addEventListener('mousemove', this.eventHandler.bind(this, 'mousemove'));
    canvas.addEventListener('mouseup', this.eventHandler.bind(this, 'mouseup'));
    canvas.addEventListener('mouseout', this.eventHandler.bind(this, 'mouseout'));
    canvas.addEventListener('wheel', this.eventHandler.bind(this, 'mousewheel'));
  }
  private eventHandler(eventType: string, e: MouseEvent) {
    const eventActions = {
      mousedown: this.onmousedown,
      mousemove: this.onmousemove,
      mousewheel: this.onmousewheel,
      mouseup: this.onmouseup,
      mouseout: this.onmouseout
    };
    const point: Point = geElementOffsetFromParent(e);
    const evt = { point, originEvent: e};
    if ((eventActions as any)[eventType]) {
      (eventActions as any)[eventType].call(this, evt);
    }
  }
  private onmousedown(evt: any) {
    this.eachWidgets((widget: IWidget) => {
      const isContain = widget.contain(evt.point);
      if (isContain) {
        widget.fire('mousedown', evt);
      }
      widget.setAttr('isMousedown', isContain);
    });
  }
  private onmousemove(evt: any) {
    let isMoveToWidget: boolean = false;
    this.eachWidgets((widget: IWidget) => {
      const isContain = widget.contain(evt.point);
      const isMouseover = widget.getAttr('isMouseover');
      if (isContain) {
        isMoveToWidget = true;
        if (!isMouseover) {
          widget.fire('mouseover', evt);
        }
        widget.fire('mousemove', evt);
        !isMouseover && widget.setAttr('isMouseover', true);
      } else if (isMouseover) {
        widget.fire('mouseout', evt);
        widget.setAttr('isMouseover', false);
      }
    });
    if (!isMoveToWidget) {
      setElementStyle(this.getHitCanvas(), { cursor: 'default'});
    }
  }
  private onmouseup(evt: any) {
    this.eachWidgets((widget: IWidget) => {
      const isContain = widget.contain(evt.point);
      if (isContain) {
        widget.fire('mouseup', evt);
      }
    });
  }
  private onmouseout() {
    this.eachWidgets((widget: IWidget) => {
      const isMouseover = widget.getAttr('isMouseover');
      if (isMouseover) {
        widget.setAttr('isMouseover', false);
        widget.fire('mouseout');
      }
    })
  }
  private onmousewheel(evt: any) {
    this.eachWidgets((widget: IWidget) => {
      if (widget.contain(evt.point)) {
        widget.fire('mousewheel', evt);
      }
    });
  }
}