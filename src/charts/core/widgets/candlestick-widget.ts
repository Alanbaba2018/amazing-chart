import IWidget from './iWidget';
import CandlestickRenderer from '../renderers/candlestick-renderer';
import { Point } from '../../typeof/type';
import { setElementStyle } from '../../util/helper';
import { Candlestick } from '..';

export default class CandlestickWidget extends IWidget {
  public renderer = new CandlestickRenderer();
  public render() {
    this.initWidget();
    const ctx: CanvasRenderingContext2D = this.getContext();
    const _cacheCtx = this.getParent().getCacheContext();
    this.setCanvasContext(ctx);
    this.setCanvasContext(_cacheCtx);
    this.renderer.draw(this.getContext(), this.getVisibleBars());
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
  public getVisibleBars() {
    const parent = this.getParent() as Candlestick;
    return parent.getVisibleBars();
  }
  public onMousemove(point: Point) {
    const parent = this.getParent();
    const _cacheCtx = parent.getCacheContext();
    this.clearCanvas(_cacheCtx, { ...this.bound, x: 0, y: -this.bound.height });
    this.renderer.drawCrossLine(_cacheCtx, point, this.getBound());
    setElementStyle(parent.getCanvas(), { cursor: 'crosshair'});
  }
}