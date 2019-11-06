import IWidget from './iWidget'
import PriceAxisRenderer from '../renderers/price-axis-renderer'
import { TickData, CommonObject } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle, isZero } from '../../util/helper'
import Canvas from '../canvas'
import BasePanel from '../basePanel'

export default class PriceAxisWidget extends IWidget {
  public config = { zIndex: 1000 }

  public renderer = new PriceAxisRenderer()

  constructor() {
    super()
    this.on('mousemove', this.onmousemove.bind(this))
    this.on('mousewheel', this.onmousewheel.bind(this))
  }

  public render() {
    const parent = this.getRoot()
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

  public setViewBound() {
    const root = this.getRoot()
    const parent = this.getParent()
    const bound = (parent as BasePanel).getBound()
    const { yAxis } = root.getAttr('yAxis')
    this.setBound({
      x: bound.x + bound.width - yAxis.width,
      y: bound.y,
      width: yAxis.width,
      height: bound.height,
    })
  }

  public getTicksData(): TickData[] {
    const parent = this.getParent() as BasePanel
    const axis = parent.yAxis
    const axisData = axis.getAxisData()
    return axisData
  }

  private onmousemove() {
    if (!this.getAttr('isMouseover')) {
      setElementStyle(this.getRoot().getHitCanvas(), { cursor: 'ns-resize' })
    }
  }

  private onmousewheel(data: CommonObject) {
    const { deltaY } = data.originEvent
    const parent = this.getParent() as BasePanel
    const { yAxis } = parent
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
