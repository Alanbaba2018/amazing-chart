import IRenderer from './iRenderer'
import Canvas from '../canvas'
import { CommonObject } from '../../typeof/type'

export default class CandlestickGridRenderer extends IRenderer {
  public draw = (ctx: CanvasRenderingContext2D, data: CommonObject) => {
    // console.log('-----------------draw CandlestickGridRenderer--------------------');
    const {
      bound: { width, height },
      yData,
      xData,
    } = data
    ctx.beginPath()
    yData.forEach(y => {
      Canvas.drawLine(ctx, 0, -y, width, -y)
    })
    xData.forEach(x => {
      Canvas.drawLine(ctx, x, 0, x, -height)
    })
    ctx.stroke()
  }
}
