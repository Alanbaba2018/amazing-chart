import IRenderer from './iRenderer';
import { Point, Bound, CandlestickBar } from '../../typeof/type';

export default class CandlestickRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CandlestickBar[]) {
    console.log('-----------------draw CandlestickRenderer----------------');
    console.log(data);
  }
  public drawCrossLine(ctx: CanvasRenderingContext2D, focusPoint: Point, bound: Bound) {
    ctx.clearRect(0, 0, bound.width, bound.height);
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    this.drawLine(ctx, 0, focusPoint.y - bound.height, bound.width, focusPoint.y - bound.height);
    this.drawLine(ctx, focusPoint.x, 0, focusPoint.x, -bound.height);
    ctx.stroke();
  }
}