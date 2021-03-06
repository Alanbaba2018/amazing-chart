import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { Bound, Point } from '../../typeof/type'

interface TickMark {
  p: number
  label: string
}
export default class TimelineRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: { bound: Bound; timeAxisHeight: number }) {
    // console.log('-----------------draw TimeAxisRenderer--------------------');
    ctx.beginPath()
    this.drawBorder(ctx, data.bound, data.timeAxisHeight)
    ctx.stroke()
  }

  public drawBorder = (ctx: CanvasRenderingContext2D, bound: Bound, timeAxisHeight: number) => {
    const { width } = bound
    Canvas.drawLine(ctx, 0, -timeAxisHeight, width, -timeAxisHeight)
    Canvas.drawLine(ctx, 0, -0.5, width, -0.5)
  }

  public drawShadow = (ctx: CanvasRenderingContext2D, bounds: Bound[] = []) => {
    bounds.forEach(bound => {
      const { x, y, width, height } = bound
      Canvas.fillRect(ctx, x, -(y + height), width, height)
    })
  }

  public drawTrendLine = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    ctx.beginPath()
    Canvas.drawLines(ctx, points)
    ctx.stroke()
  }

  public drawTicks = (ctx: CanvasRenderingContext2D, tickMarks: TickMark[], textMargin: number, tickWidth: number) => {
    ctx.beginPath()
    tickMarks.forEach(tick => {
      Canvas.drawLine(ctx, tick.p, 0, tick.p, -tickWidth)
      Canvas.drawText(ctx, tick.label, tick.p, -tickWidth - textMargin)
    })
    ctx.stroke()
  }
}
