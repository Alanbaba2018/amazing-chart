import IWidget from './iWidget'
import TimeAxisRenderer from '../renderers/time-axis-renderer'
import { TickData } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle } from '../../util/helper'
import TimeAxis from '../../model/time-axis'
import Canvas from '../canvas'

export default class TimeAxisWidget extends IWidget {
  public config = { zIndex: 1000 };

  public renderer = new TimeAxisRenderer();

  constructor () {
    super()
    this.on('mousemove', this.mousemove.bind(this))
    this.on('mouseout', this.onmouseout.bind(this))
    this.on('mousedown', this.onmousedown.bind(this))
  }

  public render () {
    const parent = this.getParent()
    const { xAxis: config, background, marginBottom, marginRight } = parent.getConfig()
    const ctx: CanvasRenderingContext2D = parent.getAxisContext()
    ctx.save()
    this.setCanvasTransform(ctx)
    setCanvasContextStyle(ctx, config)
    Canvas.drawBackground(ctx, background, { ...this.bound, x: 0, y: -this.bound.height })
    const { tickWidth, textMargin } = config
    const xAxis = this.getParent().getXAxis() as TimeAxis
    this.renderer.draw(ctx, {
      bound: this.bound,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin,
      timeScaleType: xAxis.timeScaleType,
    })
    const rightBottomBound = { x: this.bound.width, y: -this.bound.height, width: marginRight, height: marginBottom }
    Canvas.drawBackground(ctx, background, rightBottomBound)
    this.renderer.drawRightBottomBoundBorder(ctx, { ...rightBottomBound, y: 0 })
    ctx.restore()
  }

  public setWidgetBound () {
    const parent = this.getParent()
    const { marginLeft, marginRight, marginBottom, width, height } = parent.getConfig()
    this.setBound({
      x: marginLeft,
      y: height,
      width: width - marginLeft - marginRight,
      height: marginBottom,
    })
  }

  public getTicksData (): TickData[] {
    const parent = this.getParent()
    if (parent) {
      const axis = parent.getXAxis()
      const axisData = axis.getAxisData()
      return axisData
    }
    return []
  }

  private onmouseout () {
    const parent = this.getParent()
    const _hitCtx = parent.getHitContext()
    Canvas.clearRect(_hitCtx)
    this.clearDragEvent()
  }

  private onmousedown (evt: any) {
    let { x: startX } = evt.point
    this.on('mousemove.mousedown', (e: any) => {
      const { x: moveX } = e.point
      this.getParent().shiftTimeLine(startX - moveX)
      startX = moveX
    })
    this.on('mouseup.mousedown', this.clearDragEvent)
  }

  private clearDragEvent () {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }

  private mousemove () {
    if (!this.getAttr('isMouseover')) {
      setElementStyle(this.getParent().getHitCanvas(), { cursor: 'ew-resize' })
    }
  }
}
