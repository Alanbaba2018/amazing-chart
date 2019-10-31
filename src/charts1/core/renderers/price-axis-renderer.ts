import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { TickData } from '../../typeof/type'

export default class PriceAxisRenderer extends IRenderer {
  public drawBorder = (ctx: CanvasRenderingContext2D, height: number) => {
    Canvas.drawLine(ctx, 0, 0, 0, -height)
  }

  public drawTicks = (ctx: CanvasRenderingContext2D, ticksData: TickData[], textMargin: number, tickWidth: number) => {
    ticksData.forEach(tick => {
      Canvas.drawLine(ctx, 0, -tick.p, tickWidth, -tick.p)
      ctx.fillText(`${(tick.v as number).toFixed(2)}`, tickWidth + textMargin, -tick.p)
    })
  }

  public draw(ctx: CanvasRenderingContext2D, data: any) {
    // console.log('-----------------draw PriceAxisRenderer-------------');
    const {
      bound: { height },
      ticksData,
      textMargin = 0,
      tickWidth = 0,
    } = data
    ctx.beginPath()
    this.drawBorder(ctx, height)
    this.drawTicks(ctx, ticksData, textMargin, tickWidth)
    ctx.stroke()
  }
}
