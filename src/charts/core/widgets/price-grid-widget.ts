import IWidget from './iWidget';
import PriceGridRenderer from '../renderers/price-grid-renderer';
import Axis from '../../model/axis';
import { TickData } from '../../typeof/type';

export default class PriceGridWidget extends IWidget {
  public renderer = new PriceGridRenderer();
  public render() {
    this.initWidget();
    const ctx: CanvasRenderingContext2D = this.getContext();
    this.setCanvasContext(ctx);
    this.renderer.draw(ctx, { bound: this.bound, yAxisData: this.getYAxisData()});
    ctx.restore();
  }
  public initWidget() {
    const parent = this.getParent();
    if (parent) {
      const { marginLeft, marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
      this.setBound({
        x: marginLeft,
        y: height - marginBottom,
        width: width - marginLeft - marginRight,
        height: height - marginBottom - marginTop
      });
    }
  }
  public getYAxisData(): number[] {
    const parent = this.getParent();
    if (parent) {
      const extent = parent.getYExtent();
      const axis = new Axis([0, 0], extent, [0, this.bound.height]);
      const yAxisData = axis.getAxisData().map((tickData: TickData) => tickData.p);
      return yAxisData;
    }
    return [];
  }
}