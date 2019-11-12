import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { Point, Bound, CandlestickBar, Trend, CommonObject, ColorMap } from '../../typeof/type'

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
          // Canvas.strokeRect(ctx, x, y, width, height)
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
          Canvas.fillRect(ctx, x, y, width, height)
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
