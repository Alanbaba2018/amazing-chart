import IWidget from './iWidget'
import CandlestickRenderer from '../renderers/candlestick-renderer'
import { Point, CommonObject, ExtendView, ViewType } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle, formatTime, isZero } from '../../util/helper'
import Canvas from '../canvas'
import TimeAxis from '../../model/time-axis'
import * as Indicator from '../indicator'

export default class CandlestickWidget extends IWidget {
  public config = { zIndex: 1 }

  public renderer = new CandlestickRenderer()

  constructor() {
    super()
    this.on('mousemove', this.mousemove.bind(this))
    this.on('mouseout', this.onmouseout.bind(this))
    this.on('mousedown', this.onmousedown.bind(this))
    this.on('mousewheel', this.onmousewheel.bind(this))
  }

  public render() {
    const config = this.getParent().getAttr('candlestick')
    const ctx: CanvasRenderingContext2D = this.getContext()
    ctx.save()
    this.setCanvasTransform(ctx)
    setCanvasContextStyle(ctx, config)
    this.renderer.draw(ctx, this.getVisibleBars(), config)
    this.renderExtendViews(ctx)
    ctx.restore()
  }

  public setWidgetBound() {
    const parent = this.getParent()
    const { xAxis, yAxis, margin, width, height, timeline } = parent.getConfig()
    this.setBound({
      x: margin.left,
      y: height - xAxis.height - timeline.height - margin.bottom,
      width: width - yAxis.width - margin.left - margin.right,
      height: height - xAxis.height - timeline.height - margin.bottom - margin.top,
    })
  }

  private renderExtendViews(ctx: CanvasRenderingContext2D) {
    const extendViews: ExtendView[] = this.getParent().getAttr('extends') || []
    extendViews.forEach(view => {
      if (view.type === ViewType.EMA) {
        const { params, styles } = view
        const lines = this.getEMALines(params.periods)
        this.renderer.drawMultiLines(ctx, lines, styles.colors)
      } else if (view.type === ViewType.BOLL) {
        const { styles } = view
        const lines = this.getBollLines()
        this.renderer.drawMultiLines(ctx, lines, styles.colors)
      }
    })
  }

  private getBollLines(): Point[][] {
    const parent = this.getParent()
    const xAxis = parent.getXAxis()
    const yAxis = parent.getYAxis()
    const visibleBars = this.getVisibleBars()
    const lineMap: { [k: string]: Point[] } = {
      up: [],
      md: [],
      dn: [],
    }
    for (let i = 0; i < visibleBars.length; i++) {
      const item = visibleBars[i]
      const x = xAxis.getCoordOfValue(item.time)
      const upY = yAxis.getCoordOfValue(item[Indicator.BOLL.upKey])
      const mdY = yAxis.getCoordOfValue(item[Indicator.BOLL.mdKey])
      const dnY = yAxis.getCoordOfValue(item[Indicator.BOLL.dnKey])
      lineMap.up.push({ x, y: -upY })
      lineMap.md.push({ x, y: -mdY })
      lineMap.dn.push({ x, y: -dnY })
    }
    return [lineMap.up, lineMap.md, lineMap.dn]
  }

  private getEMALines(periods: number[]): Point[][] {
    const parent = this.getParent()
    const xAxis = parent.getXAxis()
    const yAxis = parent.getYAxis()
    const visibleBars = this.getVisibleBars()
    const lines: Point[][] = []
    for (let i = 0; i < visibleBars.length; i++) {
      const item = visibleBars[i]
      const x = xAxis.getCoordOfValue(item.time)
      for (let j = 0; j < periods.length; j++) {
        const y = yAxis.getCoordOfValue(item[`EMA${periods[j]}`])
        if (i === 0) {
          lines[j] = []
        }
        lines[j].push({ x, y: -y })
      }
    }
    return lines
  }

  private getVisibleBars() {
    const parent = this.getParent()
    return parent.getVisibleBars()
  }

  // transfer absolute point to draw-axis point
  private transformPointToView(point: Point): Point {
    const margin = this.getParent().getAttr('margin')
    return {
      x: point.x - margin.left,
      y: this.bound.y - point.y,
    }
  }

  private mousemove(evt: any) {
    const parent = this.getParent()
    if (!this.getAttr('isMouseover')) {
      setElementStyle(parent.getHitCanvas(), { cursor: 'crosshair' })
    }
    const isShowCrossLine = parent.getAttr('showCrossLine')
    if (!isShowCrossLine) return
    const _hitCtx = parent.getHitContext()
    const xAxis = parent.getXAxis()
    const yAxis = parent.getYAxis()
    const config = parent.getAttr('crossLine')
    const viewPoint = this.transformPointToView(evt.point)
    Canvas.clearRect(_hitCtx)
    _hitCtx.save()
    this.setCanvasTransform(_hitCtx)
    setCanvasContextStyle(_hitCtx, { strokeStyle: config.strokeStyle })
    this.renderer.drawCrossLine(_hitCtx, viewPoint, this.getBound())
    const xLabel = {
      point: { x: viewPoint.x, y: 0 },
      text: formatTime(xAxis.getValueOfCoord(viewPoint.x)),
      color: config.xLabelColor,
    }
    const yLabel = {
      point: { x: this.bound.width, y: viewPoint.y },
      text: yAxis.getValueOfCoord(viewPoint.y).toFixed(2),
      color: config.yLabelColor,
    }
    const bgColor = config.background
    this.renderer.drawAxisValueLabel(_hitCtx, { xLabel, yLabel, bgColor })
    _hitCtx.restore()
  }

  private onmouseout() {
    const parent = this.getParent()
    const _hitCtx = parent.getHitContext()
    Canvas.clearRect(_hitCtx)
    this.clearDragEvent()
  }

  private onmousedown(evt: any) {
    let { x: startX } = evt.point
    this.on('mousemove.mousedown', (e: any) => {
      const { x: moveX } = e.point
      this.getParent().shiftTimeLine(startX - moveX)
      startX = moveX
    })
    this.on('mouseup.mousedown', this.clearDragEvent)
  }

  private onmousewheel(data: CommonObject) {
    const {
      originEvent: { deltaY },
      point,
    } = data
    const parent = this.getParent()
    const timeAxis = parent.getXAxis() as TimeAxis
    const oldScaleCoeff = timeAxis.getCurrentScaleCoeff()
    const timeValue = timeAxis.getValueOfCoord(point.x)
    const { scaleRatio } = parent.getAttr('xAxis')
    // deltaY > 0 ? 1.05 : 0.95;
    // zoomIn and zoomOut should be reciprocal relationship
    const coeff = deltaY > 0 ? 1 + scaleRatio : 1 / (1 + scaleRatio)
    timeAxis.scaleAroundTimestamp(timeValue, coeff)
    const fullTimeExtent = parent.getTimeExtent()
    const timeRange = timeAxis.domainRange
    const currentInterval = timeRange.getInterval()
    // some border condition should be limited
    if (timeRange.getMinValue() > fullTimeExtent[1]) {
      timeRange.setMinValue(fullTimeExtent[1]).setMaxValue(fullTimeExtent[1] + currentInterval)
    }
    if (timeRange.getMinValue() < fullTimeExtent[0] || timeRange.getMaxValue() < fullTimeExtent[0]) {
      timeRange.setMinValue(fullTimeExtent[0]).setMaxValue(fullTimeExtent[0] + currentInterval)
    }
    const newScaleCoeff = timeAxis.getCurrentScaleCoeff()
    if (!isZero(oldScaleCoeff - newScaleCoeff)) {
      parent.updateTimeExtent()
    }
  }

  private clearDragEvent() {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }
}
