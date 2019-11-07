import IWidget from './iWidget'
import TimelineRenderer from '../renderers/timeline-renderer'
import { CandlestickItem, Bound, Point, TimeInterval, DrawMode } from '../../typeof/type'
import {
  setElementStyle,
  setCanvasContextStyle,
  isBoundContain,
  getIntegerHourTimes,
  getIntegerOrHalfDayTimes,
  getIntegerWeekTimes,
  getMonthFirstDayTimes,
  formatTime,
} from '../../util/helper'
import Axis from '../../model/axis'
import Canvas from '../canvas'

interface TickMark {
  p: number
  label: string
}
export default class TimelineWidget extends IWidget {
  public config = { zIndex: 1 }

  public renderer = new TimelineRenderer()

  private _xAxis: Axis

  private _yAxis: Axis

  private _minUnitWidth: number = 80

  constructor() {
    super()
    this.initEvents()
  }

  public render(drawMode: DrawMode) {
    this.setAxis()
    const parent = this.getRoot()
    const {
      borderColor,
      shadowColor,
      timeAxisHeight,
      trenLineColor,
      tickColor,
      tickMarkColor,
      textBaseline,
      textAlign,
      tickWidth,
      textMargin,
    } = this.getConfig()
    const staticCtx: CanvasRenderingContext2D = parent.getStaticContext()
    const shadowCtx = parent.getContext()
    staticCtx.save()
    shadowCtx.save()
    this.setCanvasTransform(staticCtx)
    if (drawMode === DrawMode.All) {
      setCanvasContextStyle(staticCtx, { strokeStyle: borderColor })
      // draw border line
      this.renderer.draw(staticCtx, { bound: this.bound, timeAxisHeight })
      const points = this.getTrendPoints()
      setCanvasContextStyle(staticCtx, { strokeStyle: trenLineColor })
      this.renderer.drawTrendLine(staticCtx, points)
      // draw timeline tickmarks
      setCanvasContextStyle(staticCtx, { strokeStyle: tickColor, fillStyle: tickMarkColor, textBaseline, textAlign })
      const tickMarks = this.getTimelineTickMark()
      this.renderer.drawTicks(staticCtx, tickMarks, textMargin, tickWidth)
    }
    // draw no-current extent time bounds
    this.setCanvasTransform(shadowCtx)
    setCanvasContextStyle(shadowCtx, { fillStyle: shadowColor })
    const shadowBounds = this.getShadowBounds()
    this.renderer.drawShadow(shadowCtx, shadowBounds)
    // draw slider bound
    const sliderBound = this.getSliderBound()
    setCanvasContextStyle(shadowCtx, { fillStyle: this.getAttr('sliderColor') })
    this.renderer.drawShadow(shadowCtx, [sliderBound])
    staticCtx.restore()
    shadowCtx.restore()
  }

  public setViewBound() {
    const parent = this.getParent()
    this.setAttrs(parent.getAttr('timeline'))
    const { margin, width, height } = parent.getConfig()
    this.setBound({
      x: margin.left,
      y: height - margin.bottom,
      width: width - margin.left - margin.right,
      height: this.getAttr('height'),
    })
  }

  public getTrendPoints(): Point[] {
    const parent = this.getParent()
    const seriesData: CandlestickItem[] = parent.getSeriesData()
    const offsetHeight = this.getAttr('timeAxisHeight')
    return seriesData.map((item: CandlestickItem) => {
      const { time, high } = item
      return { x: this._xAxis.getCoordOfValue(time), y: -(this._yAxis.getCoordOfValue(high) + offsetHeight) }
    })
  }

  private setAxis() {
    // To Do improve unnecessary reconstructor
    const { xExtent, yExtent } = this.getExtent()
    this._xAxis = new Axis(xExtent, [0, this.bound.width], false)
    this._yAxis = new Axis(yExtent, [5, this.bound.height - this.getAttr('timeAxisHeight') - 5], false)
  }

  private getTimelineTickMark(): TickMark[] {
    const minTime = this._xAxis.domainRange.getMinValue()
    const maxTime = this._xAxis.domainRange.getMaxValue()
    const buildTickMarks = (timeList: number[], formatter: string) =>
      timeList.map(time => ({ p: this._xAxis.getCoordOfValue(time), label: formatTime(time, formatter) }))
    const integerHourList = getIntegerHourTimes(minTime, maxTime)
    if (this.isLargeerThanMinWidth(integerHourList)) {
      return buildTickMarks(integerHourList, 'hh:00')
    }
    const halfDayHourList = getIntegerOrHalfDayTimes(minTime, maxTime, TimeInterval.Hour * 12)
    if (this.isLargeerThanMinWidth(halfDayHourList)) {
      return buildTickMarks(halfDayHourList, 'hh:00')
    }
    const oneDayList = getIntegerOrHalfDayTimes(minTime, maxTime, TimeInterval.Hour * 24)
    if (this.isLargeerThanMinWidth(oneDayList)) {
      return buildTickMarks(oneDayList, 'MM/DD')
    }
    const weekList = getIntegerWeekTimes(minTime, maxTime)
    if (this.isLargeerThanMinWidth(weekList)) {
      return buildTickMarks(weekList, 'MM/DD')
    }
    const everyMonthFirstDays = getMonthFirstDayTimes(minTime, maxTime, 1)
    if (this.isLargeerThanMinWidth(everyMonthFirstDays)) {
      return buildTickMarks(everyMonthFirstDays, 'MM/01')
    }
    const threeMonthFirstDays = getMonthFirstDayTimes(minTime, maxTime, 3)
    if (this.isLargeerThanMinWidth(threeMonthFirstDays)) {
      return buildTickMarks(threeMonthFirstDays, 'MM/01')
    }
    const halfYearMonthFirstDays = getMonthFirstDayTimes(minTime, maxTime, 6)
    return buildTickMarks(halfYearMonthFirstDays, 'MM/01')
  }

  private isLargeerThanMinWidth(integerTimeList: number[]): boolean {
    const coordExtent = this._xAxis.coordRange.getInterval()
    return coordExtent / integerTimeList.length > this._minUnitWidth
  }

  private getShadowBounds(): Bound[] {
    const parent = this.getRoot()
    const currentTimeRange = parent.getXAxis().domainRange
    const timeAxisHeight = this.getAttr('timeAxisHeight')
    const bounds: Bound[] = []
    // slider is contained by current time extent
    if (currentTimeRange.contains(this._xAxis.domainRange, false)) return []
    if (this._xAxis.domainRange.contain(currentTimeRange.getMinValue(), true)) {
      const x = this._xAxis.getCoordOfValue(currentTimeRange.getMinValue())
      bounds.push({ x: 0, y: timeAxisHeight, width: x, height: this.bound.height - timeAxisHeight })
    }
    if (this._xAxis.domainRange.contain(currentTimeRange.getMaxValue(), true)) {
      const x = this._xAxis.getCoordOfValue(currentTimeRange.getMaxValue())
      bounds.push({ x, y: timeAxisHeight, width: this.bound.width - x, height: this.bound.height - timeAxisHeight })
    }
    // slider is out of current time extent
    if (bounds.length === 0) {
      bounds.push({ x: 0, y: timeAxisHeight, width: this.bound.width, height: this.bound.height - timeAxisHeight })
    }
    return bounds
  }

  private getSliderBound(): Bound {
    const parent = this.getRoot()
    const currentTimeRange = parent.getXAxis().domainRange
    const x1 = this._xAxis.getCoordOfValue(currentTimeRange.getMinValue())
    const x2 = this._xAxis.getCoordOfValue(currentTimeRange.getMaxValue())
    const timeAxisHeight = this.getAttr('timeAxisHeight')
    return { x: x1, y: timeAxisHeight, width: x2 - x1, height: this.bound.height - timeAxisHeight }
  }

  // get all data extents
  private getExtent() {
    const parent = this.getParent()
    const seriesData: CandlestickItem[] = parent.getSeriesData()
    const xValues: number[] = seriesData.map((rowData: CandlestickItem) => rowData.time)
    const xExtent = [Math.min(...xValues), Math.max(...xValues)]
    const yValues: number[] = seriesData.map((rowData: CandlestickItem) => rowData.high)
    const yExtent = [Math.min(...yValues), Math.max(...yValues)]
    return { xExtent, yExtent }
  }

  // is mouseover in shadow
  private isOverShadowBounds(point: Point): boolean {
    if (!this._xAxis || !this._yAxis) return false
    const viewPoint = this.transformPointToView(point)
    const shadowBounds = this.getShadowBounds()
    for (let i = 0; i < shadowBounds.length; i++) {
      if (isBoundContain(shadowBounds[i], viewPoint)) {
        return true
      }
    }
    return false
  }

  // is mouseover in slider
  private isOverSliderBound(point: Point): boolean {
    // when data is not loaded, axis is undefined
    if (!this._xAxis || !this._yAxis) return false
    const viewPoint = this.transformPointToView(point)
    const sliderBound = this.getSliderBound()
    return isBoundContain(sliderBound, viewPoint)
  }

  private initEvents() {
    this.on('mousemove', this.mousemove.bind(this))
    this.on('mouseout', this.onmouseout.bind(this))
    this.on('mousedown', this.onmousedown.bind(this))
  }

  private onmouseout() {
    const parent = this.getRoot()
    const _hitCtx = parent.getHitContext()
    Canvas.clearRect(_hitCtx)
    this.clearDragEvent()
  }

  private onmousedown(evt: any) {
    let { x: startX } = evt.point
    const parent = this.getRoot()
    // if click shadow bounds
    if (this.isOverShadowBounds(evt.point)) {
      const clickTimestamp = this._xAxis.getValueOfCoord(startX)
      parent.locateTimeLine(clickTimestamp)
    }
    // if click slider bound
    if (this.isOverSliderBound(evt.point)) {
      const unitValue = this._xAxis.domainRange.getInterval() / this._xAxis.coordRange.getInterval()
      this.on('mousemove.mousedown', (e: any) => {
        const { x: moveX } = e.point
        parent.shiftTimeLineByTime((moveX - startX) * unitValue)
        startX = moveX
      })
      this.on('mouseup.mousedown', this.clearDragEvent)
    }
  }

  private clearDragEvent() {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }

  private mousemove(evt: any) {
    if (this.isOverSliderBound(evt.point)) {
      setElementStyle(this.getRoot().getHitCanvas(), { cursor: 'pointer' })
    } else {
      setElementStyle(this.getRoot().getHitCanvas(), { cursor: 'default' })
    }
  }
}
