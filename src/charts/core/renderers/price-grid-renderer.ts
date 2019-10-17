import IRenderer from './iRenderer';
import { CommonObject } from '../../typeof/type'; 

export default class PriceGridRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CommonObject) {
    console.log('-----------------draw PriceGridRenderer--------------------');
    const { bound: { width }, yAxisData } = data;
    ctx.beginPath();
    for (const y of yAxisData) {
      this.drawLine(ctx, 0, -y, width, -y);
    }
    ctx.stroke();
  }
}