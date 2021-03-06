import {
  Point,
  CommonObject,
  TextBaseLine,
  TextAlign,
  AxisLabels,
  ColorMap,
  StandardBar,
  Bound,
} from '../../typeof/type'
import Canvas from '../canvas'

interface ExtentBound {
  minX: number
  minY: number
  maxX: number
  maxY: number
}
export default abstract class IRenderer {
  public abstract draw(ctx: CanvasRenderingContext2D, data: any, config?: CommonObject): void

  public drawCrossLine = (ctx: CanvasRenderingContext2D, focusPoint: Point, extent: ExtentBound) => {
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    const { minX, minY, maxX, maxY } = extent
    // draw horizontal line
    Canvas.drawLine(ctx, minX, -focusPoint.y, maxX, -focusPoint.y)
    // draw vertical line
    Canvas.drawLine(ctx, focusPoint.x, minY, focusPoint.x, maxY)
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
    const xLabelBound = {
      x: xLabel.point.x - textWidth / 2,
      y: xLabel.point.y,
      width: textWidth,
      height: rectHeight + textMargin,
    }
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
    Canvas.drawText(ctx, xLabel.text, xLabel.point.x, xLabel.point.y + tickWidth + textMargin)

    // 绘制marker刻度线
    ctx.setLineDash([])
    ctx.beginPath()
    Canvas.drawLine(ctx, yLabel.point.x, -yLabel.point.y, yLabel.point.x + tickWidth, -yLabel.point.y)
    Canvas.drawLine(ctx, xLabel.point.x, xLabel.point.y, xLabel.point.x, xLabel.point.y + tickWidth)
    ctx.stroke()
  }

  public drawCandleBar = (ctx: CanvasRenderingContext2D, barDatas: StandardBar[]) => {
    // draw red bars
    ctx.fillStyle = ColorMap.CandleRed
    ctx.strokeStyle = ColorMap.CandleBorderRed
    ctx.lineWidth = 1
    ctx.beginPath()
    barDatas.forEach(bar => {
      const { x, y, width, height } = bar
      if (height > 0) {
        if (width < 2) {
          Canvas.drawLine(ctx, x, -y, x, -(y - height))
        } else {
          Canvas.strokeRect(ctx, x, -y, width, height)
          Canvas.fillRect(ctx, x, -y, width, height)
        }
      }
    })
    ctx.stroke()
    ctx.fillStyle = ColorMap.CandleGreen
    ctx.strokeStyle = ColorMap.CandleGreen
    ctx.lineWidth = 1
    ctx.beginPath()
    barDatas.forEach(bar => {
      const { x, y, width, height } = bar
      if (height < 0) {
        const _height = -height
        if (width < 2) {
          Canvas.drawLine(ctx, x, -y, x, -(y + _height))
        } else {
          Canvas.fillRect(ctx, x, -(y + _height), width, _height)
        }
      }
    })
    ctx.stroke()
  }

  public drawPolyline = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    ctx.beginPath()
    Canvas.drawLines(ctx, points)
    ctx.stroke()
  }

  public drawGrid = (ctx: CanvasRenderingContext2D, bound: Bound, xData: number[], yData: number[]) => {
    const { width, height } = bound
    ctx.beginPath()
    yData.forEach(y => {
      Canvas.drawLine(ctx, 0, -y, width, -y)
    })
    xData.forEach(x => {
      Canvas.drawLine(ctx, x, 0, x, -height)
    })
    ctx.stroke()
  }

  public drawPaths = (ctx: CanvasRenderingContext2D, paths: Point[]) => {
    ctx.beginPath()
    Canvas.drawLines(ctx, paths)
    ctx.fill()
    ctx.stroke()
  }

  public drawBars = (ctx: CanvasRenderingContext2D, barDatas: StandardBar[]) => {
    barDatas.forEach(bar => {
      Canvas.fillRect(ctx, bar.x, bar.y, bar.width, bar.height)
    })
  }

  public drawMultiLines = (ctx: CanvasRenderingContext2D, lines: Point[][], colors: string[] = []) => {
    lines.forEach((line, index) => {
      ctx.strokeStyle = colors[index] || ColorMap.White
      ctx.beginPath()
      Canvas.drawLines(ctx, line)
      ctx.stroke()
    })
  }

  public drawTitle = (ctx: CanvasRenderingContext2D, text: string, point: Point) => {
    Canvas.drawText(ctx, text, point.x, point.y)
  }
}
