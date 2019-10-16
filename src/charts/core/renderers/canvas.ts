import { Bound } from '../../typeof/type';

export default class Canvas {
  public drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  public drawBackground(ctx: CanvasRenderingContext2D, bound: Bound, color: string = '#FFFFFF') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(bound.x, bound.y, bound.width, bound.height);
    ctx.fill();
    ctx.restore();
  }
}