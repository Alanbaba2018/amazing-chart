import IRenderer from '../iRenderer'
import { Bound } from '../../../typeof/type'
import Canvas from '../../canvas'

export default class GapRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, bound: Bound) {
    const { width, height } = bound
    Canvas.drawLine(ctx, 0, -height, width, -height)
    ctx.stroke()
  }

  public drawCloseIcon = (ctx: CanvasRenderingContext2D, bound: Bound) => {
    const { x, y, width: w, height: h } = bound
    const padding = 3
    ctx.beginPath()
    Canvas.strokeRect(ctx, x, -(y + h), w, h)
    Canvas.drawLine(ctx, x + padding, -(y + padding), x + w - padding, -(y + h - padding))
    Canvas.drawLine(ctx, x + padding, -(y + h - padding), x + w - padding, -(y + padding))
    ctx.stroke()
  }
}
