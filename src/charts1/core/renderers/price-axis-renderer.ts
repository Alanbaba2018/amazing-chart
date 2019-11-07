import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { TickData, Bound } from '../../typeof/type'

export default class PriceAxisRenderer extends IRenderer {
  public drawBorder = (ctx: CanvasRenderingContext2D, height: number) => {
    Canvas.drawLine(ctx, 0, 0, 0, -height)
  }

  public drawTicks = (ctx: CanvasRenderingContext2D, ticksData: TickData[], textMargin: number, tickWidth: number) => {
    ctx.beginPath()
    ticksData.forEach(tick => {
      Canvas.drawLine(ctx, 0, -tick.p, tickWidth, -tick.p)
      ctx.fillText(`${(tick.v as number).toFixed(2)}`, tickWidth + textMargin, -tick.p)
    })
    ctx.stroke()
  }

  public draw(ctx: CanvasRenderingContext2D, bound: Bound) {
    // console.log('-----------------draw PriceAxisRenderer-------------');
    ctx.beginPath()
    this.drawBorder(ctx, bound.height)
    ctx.stroke()
  }
}
