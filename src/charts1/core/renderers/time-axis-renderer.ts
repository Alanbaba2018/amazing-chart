import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { Bound, TickData, TimeScaleType } from '../../typeof/type'
import { getAxisDateLabel } from '../../util/helper'

export default class TimeAxisRenderer extends IRenderer {
  public draw (ctx: CanvasRenderingContext2D, data: any) {
    // console.log('-----------------draw TimeAxisRenderer--------------------');
    const { bound, ticksData, textMargin = 0, tickWidth = 0, timeScaleType } = data
    ctx.beginPath()
    this.drawBorder(ctx, bound)
    this.drawTicks(ctx, ticksData, bound.height, textMargin, tickWidth, timeScaleType)
    ctx.stroke()
  }

  public drawBorder (ctx: CanvasRenderingContext2D, bound: Bound) {
    const { width, height } = bound
    Canvas.drawLine(ctx, 0, -height, width, -height)
  }

  public drawRightBottomBoundBorder (ctx: CanvasRenderingContext2D, bound: Bound) {
    ctx.beginPath()
    const { x, y, width, height } = bound
    Canvas.drawLine(ctx, x, y - height, x + width, y - height)
    Canvas.drawLine(ctx, x, y, x, y - height)
    ctx.stroke()
  }

  public drawTicks (
    ctx: CanvasRenderingContext2D,
    ticksData: TickData[],
    height: number,
    textMargin: number,
    tickWidth: number,
    timeScaleType: TimeScaleType,
  ) {
    ticksData.forEach(tick => {
      const dateLabel = getAxisDateLabel(tick.v as number, timeScaleType)
      if (dateLabel) {
        Canvas.drawLine(ctx, tick.p, -height, tick.p, -height + tickWidth)
        ctx.fillText(dateLabel, tick.p, -height + tickWidth + textMargin)
      }
    })
  }
}
