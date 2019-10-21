import IWidget from './iWidget';
import TimeAxisRenderer from '../renderers/time-axis-renderer';
import { TickData } from '../../typeof/type';
import { setElementStyle } from '../../util/helper';
import TimeAxis from '../../model/time-axis';
import Canvas from '../canvas';

export default class TimeAxisWidget extends IWidget {
  public config = { zIndex: 1000 };
  public renderer = new TimeAxisRenderer();
  constructor() {
    super();
    this.on('mousemove', this.mousemove.bind(this));
  }
  public render() {
    this.initWidget();
    const parent = this.getParent();
    const { xAxis: config, background } = parent.getConfig();
    const ctx: CanvasRenderingContext2D = parent.getAxisContext();
    ctx.save();
    this.setCanvasTransform(ctx);
    this.setCanvasContextStyle(ctx, config);
    Canvas.drawBackground(ctx, background, { ...this.bound, x: 0, y: -this.bound.height});
    const { marginRight } = parent.getConfig();
    const { tickWidth = 5, textMargin = 5 } = this.getConfig();
    const xAxis = this.getParent().getXAxis() as TimeAxis;
    this.renderer.draw(ctx, {
      bound: this.bound,
      extendHeight: marginRight,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin,
      timeScaleType: xAxis.timeScaleType
    });
    ctx.restore();
  }
  public initWidget() {
    const parent = this.getParent();
    const { marginLeft, marginRight, marginBottom, width, height } = parent.getConfig();
    this.setBound({
      x: marginLeft,
      y: height,
      width: width - marginLeft - marginRight,
      height: marginBottom
    });
  }
  public getTicksData(): TickData[] {
    const parent = this.getParent();
    if (parent) {
      const axis = parent.getXAxis();
      const axisData = axis.getAxisData();
      return axisData;
    }
    return [];
  }
  public mousemove() {
    setElementStyle(this.getParent().getHitCanvas(), { cursor: 'ew-resize'});
  }
}