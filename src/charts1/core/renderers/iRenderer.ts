import { Point, Bound, CommonObject, TextBaseLine, TextAlign, AxisLabels } from '../../typeof/type'
import Canvas from '../canvas'

export default abstract class IRenderer {
  public abstract draw(ctx: CanvasRenderingContext2D, data: any, config?: CommonObject): void

  public drawCrossLine = (ctx: CanvasRenderingContext2D, focusPoint: Point, bound: Bound) => {
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    Canvas.drawLine(ctx, 0, -focusPoint.y, bound.width, -focusPoint.y)
    Canvas.drawLine(ctx, focusPoint.x, 0, focusPoint.x, -bound.height)
    ctx.stroke()
  }

  public drawAxisValueLabel = (ctx: CanvasRenderingContext2D, labels: AxisLabels) => {
    // 刻度线宽度
    const tickWidth = 5
    // 文字偏移距离
    const textMargin = 3
    const rectHeight = 20
    const { xLabel, yLabel } = labels
    let textWidth = Math.ceil(ctx.measureText(yLabel.text).width) + (tickWidth + textMargin) * 2
    // draw marker rect
    const yLabelBound = { x: yLabel.point.x, y: -yLabel.point.y - rectHeight / 2, width: textWidth, height: rectHeight }
    Canvas.drawBackground(ctx, labels.bgColor, yLabelBound)
    textWidth = Math.ceil(ctx.measureText(xLabel.text).width) + (tickWidth + textMargin) * 2
    const xLabelBound = { x: xLabel.point.x - textWidth / 2, y: 0, width: textWidth, height: rectHeight + textMargin }
    Canvas.drawBackground(ctx, labels.bgColor, xLabelBound)
    // draw Y label
    ctx.textAlign = TextAlign.Left
    ctx.textBaseline = TextBaseLine.Middle
    ctx.fillStyle = yLabel.color
    Canvas.drawText(ctx, yLabel.text, yLabel.point.x + tickWidth + textMargin, -yLabel.point.y)
    // draw X label
    ctx.textAlign = TextAlign.Center
    ctx.textBaseline = TextBaseLine.Top
    ctx.fillStyle = xLabel.color
    Canvas.drawText(ctx, xLabel.text, xLabel.point.x, -xLabel.point.y + tickWidth + textMargin)

    // 绘制marker刻度线
    ctx.setLineDash([])
    ctx.beginPath()
    Canvas.drawLine(ctx, yLabel.point.x, -yLabel.point.y, yLabel.point.x + tickWidth, -yLabel.point.y)
    Canvas.drawLine(ctx, xLabel.point.x, -xLabel.point.y, xLabel.point.x, -xLabel.point.y + tickWidth)
    ctx.stroke()
  }
}
