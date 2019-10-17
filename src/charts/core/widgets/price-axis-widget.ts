import IWidget from './iWidget';
import PriceAxisRenderer from '../renderers/price-axis-renderer';
import { TickData, Point } from '../../typeof/type';
import { TextBaseLine, TextAlign } from '../../typeof/const';
import Axis from '../../model/axis';
import { setElementStyle } from '../../util/helper';

export default class PriceAxisWidget extends IWidget {
  public config = { textBaseline: TextBaseLine.Middle, textAlign: TextAlign.Left, zIndex: 1000 };
  public renderer = new PriceAxisRenderer();
  public render() {
    this.initWidget();
    const ctx: CanvasRenderingContext2D = this.getContext();
    this.setCanvasContext(ctx);
    const { tickWidth = 5, textMargin = 5 } = this.getConfig();
    const { marginBottom } = this.getParent().getConfig();
    this.renderer.draw(ctx, {
      bound: this.bound,
      extendHeight: marginBottom,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin
    });
    ctx.restore();
  }
  public initWidget() {
    const parent = this.getParent();
    if (parent) {
      const { marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
      this.setBound({
        x: width - marginRight,
        y: height - marginBottom,
        width: marginRight,
        height: height - marginBottom - marginTop
      });
    }
  }
  public getTicksData(): TickData[] {
    const parent = this.getParent();
    if (parent) {
      const extent = parent.getYExtent();
      const axis = new Axis([0, 0], extent, [0, this.bound.height]);
      const axisData = axis.getAxisData();
      return axisData;
    }
    return [];
  }
  public onMousemove(point: Point) {
    console.log('--------------mousemove at price-axis-widget----------');
    setElementStyle(this.getParent().getCanvas(), { cursor: 'ns-resize'});
  }
}