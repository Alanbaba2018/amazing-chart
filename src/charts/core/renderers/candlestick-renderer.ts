import IRenderer from './iRenderer';
import { Point, Bound, CandlestickBar, Trend } from '../../typeof/type';

export default class CandlestickRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CandlestickBar[]) {
    console.log('-----------------draw CandlestickRenderer----------------');
    console.log(data);
    this.drawCandlestickBars(ctx, data);
    ctx.restore();
  }
  public drawCrossLine(ctx: CanvasRenderingContext2D, focusPoint: Point, bound: Bound) {
    ctx.clearRect(0, 0, bound.width, bound.height);
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    this.drawLine(ctx, 0, focusPoint.y - bound.height, bound.width, focusPoint.y - bound.height);
    this.drawLine(ctx, focusPoint.x, 0, focusPoint.x, -bound.height);
    ctx.stroke();
  }
  public drawCandlestickBars(ctx: CanvasRenderingContext2D, bars: CandlestickBar[]) {
    // draw red bars
    ctx.fillStyle = '#ff0372';
    for (const bar of bars) { 
      const type = bar.type;
      const { x, y, width, height } = this.getBarData(bar);
      if (type === Trend.Up) {
        ctx.fillRect(x, y, width, height);
      }
    }
    ctx.fill();
    ctx.fillStyle = '#00c582';
    for (const bar of bars) { 
      const type = bar.type;
      const { x, y, width, height } = this.getBarData(bar);
      if (type === Trend.Down) {
        ctx.fillRect(x, y, width, height);
      }
    }
    ctx.fill();
  }
  private getBarData(bar: CandlestickBar): Bound {
    const { x, y, width, height } = bar;
    return {
      x: x - width / 5,
      y: -(y + height),
      width: width / 5 * 2,
      height
    };
  }
}