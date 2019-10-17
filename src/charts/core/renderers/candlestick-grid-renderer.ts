import IRenderer from './iRenderer';
import { CommonObject } from '../../typeof/type'; 

export default class CandlestickGridRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CommonObject) {
    console.log('-----------------draw CandlestickGridRenderer--------------------');
    const { bound: { width, height }, yData, xData } = data;
    ctx.beginPath();
    for (const y of yData) {
      this.drawLine(ctx, 0, -y, width, -y);
    }
    for (const x of xData) {
      this.drawLine(ctx, x, 0, x, -height);
    }
    ctx.stroke();
  }
}