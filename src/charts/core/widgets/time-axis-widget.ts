import IWidget from './iWidget';
import TimeAxisRenderer from '../renderers/time-axis-renderer';
import { TickData, Point } from '../../typeof/type';
import Axis from '../../model/axis';
import { TextBaseLine, TextAlign } from '../../typeof/const';
import { setElementStyle } from '../../util/helper';

export default class TimeAxisWidget extends IWidget {
  public config = { textBaseline: TextBaseLine.Top, textAlign: TextAlign.Center, zIndex: 1000 };
  public renderer = new TimeAxisRenderer();
  public render() {
    this.initWidget();
    const ctx: CanvasRenderingContext2D = this.getContext();
    this.setCanvasContext(ctx);
    const { marginRight } = this.getParent().getConfig();
    const { tickWidth = 5, textMargin = 5 } = this.getConfig();
    this.renderer.draw(ctx, {
      bound: this.bound,
      extendHeight: marginRight,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin
    });
    ctx.restore();
  }
  public initWidget() {
    const parent = this.getParent();
    if (parent) {
      const { marginLeft, marginRight, marginBottom, width, height } = parent.getConfig();
      this.setBound({
        x: marginLeft,
        y: height,
        width: width - marginLeft - marginRight,
        height: marginBottom
      });
    }
  }
  public getTicksData(): TickData[] {
    const parent = this.getParent();
    if (parent) {
      const extent = parent.getTimeExtent();
      const axis = new Axis([0, 0], extent, [0, this.bound.width]);
      const axisData = axis.getAxisData();
      return axisData;
    }
    return [];
  }
  public onMousemove(point: Point) {
    console.log('--------------mousemove at price-axis-widget----------');
    setElementStyle(this.getParent().getCanvas(), { cursor: 'ew-resize'});
  }
}