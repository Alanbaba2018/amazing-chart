import IWidget from './iWidget'
import CandlestickGridRenderer from '../renderers/candlestick-grid-renderer'
import { TickData } from '../../typeof/type'
import { setCanvasContextStyle } from '../../util/helper'

export default class CandlestickGridWidget extends IWidget {
  public config = { zIndex: 0 }

  public renderer = new CandlestickGridRenderer()

  public render() {
    const ctx: CanvasRenderingContext2D = this.getParent().getContext()
    const config = this.getParent().getAttr('grid')
    ctx.save()
    this.setCanvasTransform(ctx)
    setCanvasContextStyle(ctx, config)
    this.renderer.draw(ctx, { bound: this.bound, ...this.getXYTicksData() })
    ctx.restore()
  }

  public setWidgetBound() {
    const parent = this.getParent()
    const {
      xAxis,
      yAxis,
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
      width,
      height,
      timeline,
    } = parent.getConfig()
    this.setBound({
      x: marginLeft,
      y: height - xAxis.height - timeline.height - marginBottom,
      width: width - yAxis.width - marginLeft - marginRight,
      height: height - xAxis.height - timeline.height - marginBottom - marginTop,
    })
  }

  public getXYTicksData() {
    const parent = this.getParent()
    const xAxisData = parent.getXAxis().getAxisData()
    const yAxisData = parent.getYAxis().getAxisData()
    return {
      xData: xAxisData.map((tickData: TickData) => tickData.p),
      yData: yAxisData.map((tickData: TickData) => tickData.p),
    }
  }
}
