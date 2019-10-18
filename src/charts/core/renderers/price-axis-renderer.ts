import IRenderer from './iRenderer';
import { TickData } from '../../typeof/type';

export default class PriceAxisRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: any) {
    console.log('-----------------draw PriceAxisRenderer-------------');
    const { bound: { width, height }, ticksData, textMargin, tickWidth, extendHeight } = data;
    // this.drawBackground(ctx, {x: 0, y: -height, width, height}, '#12161c');
    ctx.beginPath();
    this.drawBorder(ctx, width, height, extendHeight);
    this.drawTicks(ctx, ticksData, textMargin, tickWidth);
    ctx.stroke();
  }
  public drawBorder(ctx: CanvasRenderingContext2D, width: number, height: number, extendHeight: number = 0) {
    this.drawLine(ctx, 0, extendHeight, 0, -height);
  }
  public drawTicks(ctx: CanvasRenderingContext2D, ticksData: TickData[], textMargin: number, tickWidth: number) {
    for (const tick of ticksData) {
      this.drawLine(ctx, 0, -tick.p, tickWidth, -tick.p);
      ctx.fillText(`${(tick.v as number).toFixed(2)}`, tickWidth + textMargin, -tick.p);
    }
  }
}