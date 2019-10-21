import IRenderer from './iRenderer';
import { Bound, TickData, TimeScaleType } from '../../typeof/type';
import { getShowDateLabel } from '../../util/helper';
export default class TimeAxisRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: any) {
    // console.log('-----------------draw TimeAxisRenderer--------------------');
    const { bound, extendWidth = 0, ticksData, textMargin, tickWidth, timeScaleType } = data;
    ctx.beginPath();
    this.drawBorder(ctx, bound, extendWidth);
    this.drawTicks(ctx, ticksData, bound.height, textMargin, tickWidth, timeScaleType);
    ctx.stroke();
  }
  public drawBorder(ctx: CanvasRenderingContext2D, bound: Bound, extendWidth: number = 0) {
    const { width, height } = bound;
    this.drawLine(ctx, 0, -height, width + extendWidth, -height);
  }
  public drawTicks(ctx: CanvasRenderingContext2D, ticksData: TickData[], height: number, textMargin: number, tickWidth: number, timeScaleType: TimeScaleType) {
    for (const tick of ticksData) {
      const dateLabel = getShowDateLabel(tick.v as number, timeScaleType);
      if (dateLabel) {
        this.drawLine(ctx, tick.p, -height, tick.p, -height + tickWidth);
        ctx.fillText(dateLabel, tick.p, -height + tickWidth + textMargin);
      }
    }
  }
}