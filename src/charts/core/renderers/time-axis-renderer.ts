import IRenderer from './iRenderer';
import { Bound, TickData } from '../../typeof/type';

const MonthLabel: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export default class TimeAxisRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: any) {
    console.log('-----------------draw TimeAxisRenderer--------------------');
    const { bound, extendWidth = 0, ticksData, textMargin, tickWidth } = data;
    ctx.beginPath();
    this.drawBorder(ctx, bound, extendWidth);
    this.drawTicks(ctx, ticksData, bound.height, textMargin, tickWidth);
    ctx.stroke();
  }
  public drawBorder(ctx: CanvasRenderingContext2D, bound: Bound, extendWidth: number = 0) {
    const { width, height } = bound;
    this.drawLine(ctx, 0, -height, width + extendWidth, -height);
  }
  public drawTicks(ctx: CanvasRenderingContext2D, ticksData: TickData[], height: number, textMargin: number, tickWidth: number) {
    for (const tick of ticksData) {
      const dateLabel = this.getShowDateLabel(tick.v as number);
      if (dateLabel) {
        this.drawLine(ctx, tick.p, -height, tick.p, -height + tickWidth);
        ctx.fillText(dateLabel, tick.p, -height + tickWidth + textMargin);
      }
    }
  }
  public getShowDateLabel(timestamp: number): string {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const day = date.getDate();
    if (day % 7 === 0) {
      return `${MonthLabel[month]} ${day}`;
    }
    return '';
  }
}