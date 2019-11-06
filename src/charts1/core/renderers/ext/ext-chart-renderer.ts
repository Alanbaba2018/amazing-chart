import IRenderer from '../iRenderer'
import { Bound, Point } from '../../../typeof/type'
import Canvas from '../../canvas'

export default class GapRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, bound: Bound) {
    const { width, height } = bound
    Canvas.drawLine(ctx, 0, -height, width, -height)
    ctx.stroke()
  }

  public drawCrossLine = (ctx: CanvasRenderingContext2D, focusPoint: Point, bound: Bound) => {
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    Canvas.drawLine(ctx, 0, -focusPoint.y, bound.width, -focusPoint.y)
    Canvas.drawLine(ctx, focusPoint.x, 0, focusPoint.x, -bound.height)
    ctx.stroke()
  }
}
