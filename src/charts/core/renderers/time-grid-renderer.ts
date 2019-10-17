import IRenderer from './iRenderer';
import { CommonObject } from '../../typeof/type'; 

export default class TimeGridRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CommonObject) {
    console.log('-----------------draw TimeGridRenderer--------------------');
    const { bound: { height }, axisData } = data;
    ctx.beginPath();
    for (const x of axisData) {
      this.drawLine(ctx, x, 0, x, -height);
    }
    ctx.stroke();
  }
}