import IWidget from './iWidget'
import TimeAxisRenderer from '../renderers/time-axis-renderer'
import { TickData } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle } from '../../util/helper'
import TimeAxis from '../../model/time-axis'
import Canvas from '../canvas'

export default class TimeAxisWidget extends IWidget {
  public config = { zIndex: 1000 }

  public renderer = new TimeAxisRenderer()

  constructor() {
    super()
    this.on('mousemove', this.mousemove.bind(this))
    this.on('mouseout', this.onmouseout.bind(this))
    this.on('mousedown', this.onmousedown.bind(this))
  }

  public render() {
    const parent = this.getRoot()
    const { xAxis: xAxisConfig, yAxis, background } = parent.getConfig()
    const ctx: CanvasRenderingContext2D = parent.getAxisContext()
    ctx.save()
    this.setCanvasTransform(ctx)
    // Canvas.drawBackground(ctx, background, { ...this.bound, x: 0, y: -this.bound.height })
    const { tickWidth, textMargin } = xAxisConfig
    const xAxis = this.getRoot().getXAxis() as TimeAxis
    const ticksData = this.getTicksData()
    const timeScale = xAxis.getCurrentTimeScale()
    setCanvasContextStyle(ctx, { ...xAxisConfig, strokeStyle: xAxisConfig.tickColor })
    // draw ticks
    this.renderer.drawTicks(ctx, ticksData, this.bound, textMargin, tickWidth, timeScale)
    setCanvasContextStyle(ctx, xAxisConfig)
    // draw border line
    this.renderer.draw(ctx, this.bound)
    const { width, height } = this.bound
    const rightBottomBound = { x: width, y: -height, width: yAxis.width, height: xAxisConfig.height }
    Canvas.drawBackground(ctx, background, rightBottomBound)
    this.renderer.drawRightBottomBoundBorder(ctx, { ...rightBottomBound, y: 0 })
    ctx.restore()
  }

  public setViewBound() {
    const parent = this.getRoot()
    const { xAxis, yAxis, margin, width, height, timeline } = parent.getConfig()
    this.setBound({
      x: margin.left,
      y: height - timeline.height - margin.bottom,
      width: width - yAxis.width - margin.left - margin.right,
      height: xAxis.height,
    })
  }

  public getTicksData(): TickData[] {
    const parent = this.getRoot()
    if (parent) {
      const axis = parent.getXAxis()
      const axisData = axis.getAxisData()
      return axisData
    }
    return []
  }

  private onmouseout() {
    const parent = this.getRoot()
    const _hitCtx = parent.getHitContext()
    Canvas.clearRect(_hitCtx)
    this.clearDragEvent()
  }

  private onmousedown(evt: any) {
    let { x: startX } = evt.point
    this.on('mousemove.mousedown', (e: any) => {
      const { x: moveX } = e.point
      this.getRoot().shiftTimeLine(startX - moveX)
      startX = moveX
    })
    this.on('mouseup.mousedown', this.clearDragEvent)
  }

  private clearDragEvent() {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }

  private mousemove() {
    if (!this.getAttr('isMouseover')) {
      setElementStyle(this.getRoot().getHitCanvas(), { cursor: 'ew-resize' })
    }
  }
}
