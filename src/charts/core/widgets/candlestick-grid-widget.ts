import IWidget from './iWidget';
import CandlestickGridRenderer from '../renderers/candlestick-grid-renderer';
import Axis from '../../model/axis';
import { TickData } from '../../typeof/type';

export default class CandlestickGridWidget extends IWidget {
  public config = { strokeStyle: 'strokeStyle', zIndex: 0 };
  public renderer = new CandlestickGridRenderer();
  public render() {
    this.initWidget();
    const ctx: CanvasRenderingContext2D = this.getContext();
    this.setCanvasContext(ctx);
    this.renderer.draw(ctx, { bound: this.bound, ...this.getXYTicksData()});
    ctx.restore();
  }
  public initWidget() {
    const parent = this.getParent();
    const { marginLeft, marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
    this.setBound({
      x: marginLeft,
      y: height - marginBottom,
      width: width - marginLeft - marginRight,
      height: height - marginBottom - marginTop
    });
  }
  public getXYTicksData() {
    const { xAxisData, yAxisData } = this.getParent().getAxisData();
    return {
      xData: xAxisData.map((tickData: TickData) => tickData.p),
      yData: yAxisData.map((tickData: TickData) => tickData.p)
    };
  }
  // no-use
  public getYAxisData(): number[] {
    const parent = this.getParent();
    const extent = parent.getYExtent();
    const axis = new Axis([0, 0], extent, [0, this.bound.height]);
    const yAxisData = axis.getAxisData().map((tickData: TickData) => tickData.p);
    return yAxisData;
  }
  // no-use
  public getXAxisData(): number[] {
    const parent = this.getParent();
    const extent = parent.getTimeExtent();
    const axis = new Axis([0, 0], extent, [0, this.bound.width]);
    const xAxisData = axis.getAxisData().map((tickData: TickData) => tickData.p);
    return xAxisData;
  }
}