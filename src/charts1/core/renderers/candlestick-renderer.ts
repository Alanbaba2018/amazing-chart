import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { Point, Bound, CandlestickBar, Trend, CommonObject, TextBaseLine, TextAlign, ColorMap } from '../../typeof/type'

interface TextLabel {
  point: Point
  text: string
  color: string
}
interface AxisLabels {
  xLabel: TextLabel
  yLabel: TextLabel
  bgColor: string
}
const getBarData = (bar: CandlestickBar): Bound => {
  const { x, y, width, height } = bar
  return {
    x: x - width,
    y: -(y + height),
    width: width * 2,
    height,
  }
}
export default class CandlestickRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CandlestickBar[], config: CommonObject) {
    // console.log('-----------------draw CandlestickRenderer----------------');
    this.drawCandlestickBars(ctx, data, config)
  }

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

  public drawCandlestickBars = (ctx: CanvasRenderingContext2D, bars: CandlestickBar[], config: CommonObject) => {
    // draw red bars
    ctx.fillStyle = config[Trend.Up].fillStyle
    ctx.strokeStyle = config[Trend.Up].strokeStyle
    ctx.lineWidth = config[Trend.Up].lineWidth
    ctx.beginPath()
    bars.forEach(bar => {
      const { type } = bar
      const { x, y, width, height } = getBarData(bar)
      if (type === Trend.Up) {
        if (width < 2) {
          Canvas.drawLine(ctx, bar.x, -bar.lowY, bar.x, -bar.highY)
        } else {
          Canvas.strokeRect(ctx, x, y, width, height)
          Canvas.fillRect(ctx, x, y, width, height)
          Canvas.drawLine(ctx, bar.x, -bar.highY, bar.x, y)
          Canvas.drawLine(ctx, bar.x, -bar.lowY, bar.x, y + height)
        }
      }
    })
    ctx.stroke()
    ctx.fillStyle = config[Trend.Down].fillStyle
    ctx.strokeStyle = config[Trend.Down].strokeStyle
    ctx.lineWidth = config[Trend.Down].lineWidth
    ctx.beginPath()
    bars.forEach(bar => {
      const { type } = bar
      const { x, y, width, height } = getBarData(bar)
      if (type === Trend.Down) {
        if (width < 2) {
          Canvas.drawLine(ctx, bar.x, -bar.lowY, bar.x, -bar.highY)
        } else {
          Canvas.strokeRect(ctx, x, y, width, height)
          Canvas.drawLine(ctx, bar.x, -bar.lowY, bar.x, -bar.closeY)
          Canvas.drawLine(ctx, bar.x, -bar.highY, bar.x, y)
        }
      }
    })
    ctx.stroke()
  }

  public drawMultiLines = (ctx: CanvasRenderingContext2D, lines: Point[][], colors: string[] = []) => {
    lines.forEach((line, index) => {
      ctx.strokeStyle = colors[index] || ColorMap.White
      ctx.beginPath()
      Canvas.drawLines(ctx, line)
      ctx.stroke()
    })
  }
}
