import IRenderer from '../iRenderer'
import { Bound } from '../../../typeof/type'
import Canvas from '../../canvas'

export default class GapRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, bound: Bound) {
    const { width, height } = bound
    Canvas.fillRect(ctx, 0, -height, width, height)
    Canvas.drawLine(ctx, 0, -height, width, -height)
    Canvas.drawLine(ctx, 0, 0, width, 0)
    ctx.stroke()
  }
}
