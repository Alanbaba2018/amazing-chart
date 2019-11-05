import IWidget from './iWidget'
import PriceAxisRenderer from '../renderers/price-axis-renderer'
import { TickData, CommonObject } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle, isZero } from '../../util/helper'
import Canvas from '../canvas'

export default class PriceAxisWidget extends IWidget {
  public config = { zIndex: 1000 }

  public renderer = new PriceAxisRenderer()

  constructor() {
    super()
    this.on('mousemove', this.onmousemove.bind(this))
    this.on('mousewheel', this.onmousewheel.bind(this))
  }

  public render() {
    const parent = this.getParent()
    const { yAxis: config, background } = parent.getConfig()
    const ctx: CanvasRenderingContext2D = parent.getAxisContext()
    ctx.save()
    this.setCanvasTransform(ctx)
    setCanvasContextStyle(ctx, config)
    Canvas.drawBackground(ctx, background, { ...this.bound, x: 0, y: -this.bound.height })
    const { tickWidth, textMargin } = config
    this.renderer.draw(ctx, {
      bound: this.bound,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin,
    })
    ctx.restore()
  }

  public setWidgetBound() {
    const parent = this.getParent()
    const { xAxis, yAxis, margin, width, height, timeline } = parent.getConfig()
    this.setBound({
      x: width - yAxis.width - margin.right,
      y: height - xAxis.height - timeline.height - margin.bottom,
      width: yAxis.width,
      height: height - xAxis.height - timeline.height - margin.bottom - margin.top,
    })
  }

  public getTicksData(): TickData[] {
    const parent = this.getParent()
    const axis = parent.getYAxis()
    const axisData = axis.getAxisData()
    return axisData
  }

  private onmousemove() {
    if (!this.getAttr('isMouseover')) {
      setElementStyle(this.getParent().getHitCanvas(), { cursor: 'ns-resize' })
    }
  }

  private onmousewheel(data: CommonObject) {
    const { deltaY } = data.originEvent
    const parent = this.getParent()
    const yAxis = parent.getYAxis()
    const oldScaleCoeff = yAxis.getCurrentScaleCoeff()
    const { scaleRatio } = parent.getAttr('yAxis')
    // deltaY > 0 ? 1.05 : 0.95;
    // zoomIn and zoomOut should be reciprocal relationship
    const coeff = deltaY > 0 ? 1 + scaleRatio : 1 / (1 + scaleRatio)
    yAxis.scaleAroundCenter(coeff)
    const newScaleCoeff = yAxis.getCurrentScaleCoeff()
    if (!isZero(oldScaleCoeff - newScaleCoeff)) {
      parent.update()
    }
  }
}
