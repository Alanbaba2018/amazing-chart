import IRenderer from './iRenderer';

export default class TimeAxisRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: any) {
    console.log('draw TimeAxisRenderer');
    this.drawBorder(ctx, data.width, data.height);
  }
  public drawBorder(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.beginPath();
    ctx.moveTo(0, -height + 0.5);
    ctx.lineTo(width - 0.5, -height + 0.5);
    ctx.lineTo(width - 0.5, 0);
    ctx.stroke();
  }
}