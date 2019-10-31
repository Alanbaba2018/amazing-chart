import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { Bound, TickData, TimeScale } from '../../typeof/type'
import { getAxisDateLabel } from '../../util/helper'

export default class TimeAxisRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, bound: Bound) {
    // console.log('-----------------draw TimeAxisRenderer--------------------');
    ctx.beginPath()
    this.drawBorder(ctx, bound)
    ctx.stroke()
  }

  public drawBorder = (ctx: CanvasRenderingContext2D, bound: Bound) => {
    const { width, height } = bound
    Canvas.drawLine(ctx, 0, -height, width, -height)
    Canvas.drawLine(ctx, 0, 0, width, 0)
    // tick X axis line
    Canvas.drawLine(ctx, 0, -height / 3, bound.width, -height / 3)
  }

  public drawRightBottomBoundBorder = (ctx: CanvasRenderingContext2D, bound: Bound) => {
    ctx.beginPath()
    const { x, y, width, height } = bound
    // top border
    Canvas.drawLine(ctx, x, y - height, x + width, y - height)
    // bottom border
    Canvas.drawLine(ctx, x, y, x + width, y)
    // left border
    Canvas.drawLine(ctx, x, y, x, y - height)
    ctx.stroke()
  }

  public drawTicks = (
    ctx: CanvasRenderingContext2D,
    ticksData: TickData[],
    bound: Bound,
    textMargin: number,
    tickWidth: number,
    timeScale: TimeScale,
  ) => {
    ctx.beginPath()
    const y = -bound.height / 3
    ticksData.forEach(tick => {
      const dateLabel = getAxisDateLabel(tick.v as number, timeScale)
      if (dateLabel) {
        Canvas.drawLine(ctx, tick.p, y, tick.p, y - tickWidth)
        ctx.fillText(dateLabel, tick.p, y - tickWidth - textMargin)
      }
    })
    ctx.stroke()
  }
}
