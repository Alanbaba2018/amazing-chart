/* eslint-disable max-lines*/
import BasePanel from './basePanel'
import IWidget from './widgets/iWidget'
import CandlestickWidget from './widgets/candlestick-widget'
import CandlestickGridWidget from './widgets/candlestick-grid-widget'
import PriceAxisWidget from './widgets/price-axis-widget'
import TimeAxisWidget from './widgets/time-axis-widget'
import TimelineWidget from './widgets/timeline-widget'
import Axis from '../model/axis'
import TimeAxis from '../model/time-axis'
import Canvas from './canvas'
import {
  PanelOptions,
  CandlestickItem,
  Point,
  Bound,
  CandlestickBar,
  Trend,
  CommonKeys,
  RegisterEvents,
} from '../typeof/type'
import {
  createCanvasElement,
  geElementOffsetFromParent,
  setElementStyle,
  getTimestamp,
  getDevicePixelRatio,
} from '../util/helper'
import CandlestickOptions from './options'

export default class Candlestick extends BasePanel {
  public config = { ...CandlestickOptions }

  protected _canvas: HTMLCanvasElement // main scene canvas

  protected _cacheCanvas: HTMLCanvasElement

  protected _bgCanvas: HTMLCanvasElement // background canvas

  protected _ctx: CanvasRenderingContext2D

  protected _hitCtx: CanvasRenderingContext2D // hit-check of mouse canvas

  protected _bgCtx: CanvasRenderingContext2D

  protected _axisCanvas: HTMLCanvasElement // axis canvas

  protected _axisCtx: CanvasRenderingContext2D

  protected _staticCanvas: HTMLCanvasElement // almost unchange canvas

  protected _staticCtx: CanvasRenderingContext2D

  protected _xAxis: Axis

  protected _yAxis: Axis

  constructor(options: PanelOptions) {
    super()
    this.setAttrs(options)
    this.initContainer()
    this.initWidgets()
    this.initEvents()
  }

  public getCanvas(): HTMLCanvasElement {
    return this._canvas
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas
    return this
  }

  public getHitCanvas(): HTMLCanvasElement {
    return this._cacheCanvas
  }

  public setHitCanvas(canvas: HTMLCanvasElement) {
    this._cacheCanvas = canvas
    return this
  }

  public getBgCanvas(): HTMLCanvasElement {
    return this._bgCanvas
  }

  public setBgCanvas(canvas: HTMLCanvasElement) {
    this._bgCanvas = canvas
    return this
  }

  public getAxisCanvas(): HTMLCanvasElement {
    return this._axisCanvas
  }

  public setAxisCanvas(canvas: HTMLCanvasElement) {
    this._axisCanvas = canvas
    return this
  }

  public setStaticCanvas(canvas: HTMLCanvasElement) {
    this._staticCanvas = canvas
    return this
  }

  public getStaticCanvas(): HTMLCanvasElement {
    return this._staticCanvas
  }

  public getContext(): CanvasRenderingContext2D {
    if (!this._ctx) {
      this.setContext(this._canvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._ctx
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx
    return this
  }

  public getHitContext(): CanvasRenderingContext2D {
    if (!this._hitCtx) {
      this.setCacheContext(this._cacheCanvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._hitCtx
  }

  public setCacheContext(ctx: CanvasRenderingContext2D) {
    this._hitCtx = ctx
    return this
  }

  public getBgContext(): CanvasRenderingContext2D {
    if (!this._bgCtx) {
      this.setBgContext(this._bgCanvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._bgCtx
  }

  public setBgContext(ctx: CanvasRenderingContext2D) {
    this._bgCtx = ctx
    return this
  }

  public getAxisContext(): CanvasRenderingContext2D {
    if (!this._axisCtx) {
      this.setAxisContext(this._axisCanvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._axisCtx
  }

  public setAxisContext(ctx: CanvasRenderingContext2D) {
    this._axisCtx = ctx
    return this
  }

  public getStaticContext(): CanvasRenderingContext2D {
    if (!this._staticCtx) {
      this.setStaticContext(this._staticCanvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._staticCtx
  }

  public setStaticContext(ctx: CanvasRenderingContext2D) {
    this._staticCtx = ctx
    return this
  }

  public getXAxis(): Axis {
    return this._xAxis
  }

  public getYAxis(): Axis {
    return this._yAxis
  }

  public resize() {
    const container = this.getAttr('container')
    if (!container) return
    this.setAttrs({ width: container.clientWidth, height: container.clientHeight })
    this.updateContainerSize()
    this.eachWidgets((widget: IWidget) => widget.setWidgetBound())
    const background = this.getAttr('background')
    background && this.setPanelBackground(background)
    this.update()
  }

  public clearPanel(bound?: Bound) {
    const ctx = this.getContext()
    const axisCtx = this.getAxisContext()
    const staticCtx = this.getStaticContext()
    Canvas.clearRect(ctx, bound)
    Canvas.clearRect(axisCtx, bound)
    Canvas.clearRect(staticCtx)
  }

  public setWidgetParent(widget: IWidget) {
    widget.setParent(this)
  }

  protected setPanelBackground(color: string) {
    const ctx = this.getBgContext()
    if (ctx) {
      ctx.save()
      ctx.scale(getDevicePixelRatio(), getDevicePixelRatio())
      const { width = 0, height = 0 } = this.getConfig()
      Canvas.drawBackground(ctx, color, { x: 0, y: 0, width, height })
      ctx.restore()
    }
  }

  public getYExtent(): number[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>()
    const values: number[] = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
      acc.push(...[cur.high, cur.low])
      return acc
    }, [])
    return [Math.min(...values), Math.max(...values)]
  }

  public getVisibleTimeExtent(): number[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>()
    const values: number[] = visibleData.map((rowData: CandlestickItem) => rowData.time)
    return [Math.min(...values), Math.max(...values)]
  }

  public getTimeExtent(): number[] {
    const seriesData: CandlestickItem[] = this.getSeriesData()
    const values: number[] = seriesData.map((rowData: CandlestickItem) => rowData.time)
    return [Math.min(...values), Math.max(...values)]
  }

  public setAxis() {
    const { xAxis, yAxis, marginLeft, marginRight, marginBottom, marginTop, width, height, timeline } = this.getConfig()
    const [viewWidth, viewHeight] = [
      width - yAxis.width - marginLeft - marginRight,
      height - xAxis.height - timeline.height - marginTop - marginBottom,
    ]
    const xExtent = this.getVisibleTimeExtent()
    const visibleSeriesData = this.getVisibleSeriesData<CandlestickItem[]>()
    this._xAxis = new TimeAxis(xExtent, [0, viewWidth], visibleSeriesData.length)
    this.setVisibleSeriesData()
    const yExtent = this.getYExtent()
    this._yAxis = new Axis(yExtent, [0, viewHeight])
  }

  public setVisibleSeriesData() {
    const timeDomainRange = this._xAxis.domainRange
    const visibleData = this.getSeriesData().filter((item: CandlestickItem) => timeDomainRange.contain(item.time))
    this.setAttr('visibleSeriesData', visibleData)
  }

  public getPositonByValue(xValue: number, yValue: number): Point {
    const x = this._xAxis.getCoordOfValue(xValue)
    const y = this._yAxis.getCoordOfValue(yValue)
    return { x, y }
  }

  public getBarPosition(bar: CandlestickItem) {
    const { time, low, high, open, close } = bar
    const x = this._xAxis.getCoordOfValue(time)
    const lowY = this._yAxis.getCoordOfValue(low)
    const highY = this._yAxis.getCoordOfValue(high)
    const openY = this._yAxis.getCoordOfValue(open)
    const closeY = this._yAxis.getCoordOfValue(close)
    return { x, lowY, highY, openY, closeY }
  }

  public getVisibleBars(): CandlestickBar[] {
    const visibleData = this.getVisibleSeriesData<CandlestickItem[]>()
    return visibleData.map((item: CandlestickItem) => {
      const { x, lowY, highY, openY, closeY } = this.getBarPosition(item)
      return {
        ...item,
        x,
        y: Math.min(openY, closeY),
        width: this._xAxis.unitWidth * this.getAttr('barWeight') || 0.3,
        height: Math.abs(closeY - openY),
        openY,
        closeY,
        highY,
        lowY,
        type: item.close - item.open > 0 ? Trend.Up : Trend.Down,
      }
    })
  }

  public initContainer() {
    const container = this.getAttr('container')
    if (!container) return
    this.setAttrs({ width: container.clientWidth, height: container.clientHeight })
    const { width = 0, height = 0 } = this.getConfig()
    const style = { position: 'absolute', left: 0, top: 0, width: `${width}px`, height: `${height}px` }
    this.setHitCanvas(createCanvasElement(width, height, { className: 'hit', style: { ...style, zIndex: 1 } }))
    this.setAxisCanvas(createCanvasElement(width, height, { className: 'axis', style: { ...style, zIndex: 0 } }))
    this.setCanvas(createCanvasElement(width, height, { className: 'scene', style: { ...style, zIndex: -1 } }))
    this.setStaticCanvas(createCanvasElement(width, height, { className: 'static', style: { ...style, zIndex: -2 } }))
    this.setBgCanvas(createCanvasElement(width, height, { className: 'bg', style: { ...style, zIndex: -3 } }))
    this.addElemens([
      this.getBgCanvas(),
      this.getStaticCanvas(),
      this.getCanvas(),
      this.getAxisCanvas(),
      this.getHitCanvas(),
    ])
    const { background = 'transparent' } = this.getConfig()
    this.setPanelBackground(background)
  }

  public initWidgets() {
    const candlewWidget = new CandlestickWidget()
    const candlestickGridWidget = new CandlestickGridWidget()
    const priceAxisWidget = new PriceAxisWidget()
    const timeAxisWidget = new TimeAxisWidget()
    const timelineWidget = new TimelineWidget()
    this.addWidgets([candlewWidget, candlestickGridWidget, priceAxisWidget, timeAxisWidget, timelineWidget])
  }

  public updateContainerSize() {
    const hitCanvas = this.getHitCanvas()
    const sceneCanvas = this.getCanvas()
    const bgCanvas = this.getBgCanvas()
    const axisCanvas = this.getAxisCanvas()
    const staticCanvas = this.getStaticCanvas()
    const { width, height } = this.getConfig()
    this.setAttrs({ width, height })
    const styles = { width: `${width}px`, height: `${height}px` }
    ;[hitCanvas, sceneCanvas, bgCanvas, axisCanvas, staticCanvas].forEach((canvas: HTMLCanvasElement) => {
      canvas.width = width * getDevicePixelRatio()
      canvas.height = height * getDevicePixelRatio()
      setElementStyle(canvas, styles)
    })
    this.setAxis()
  }

  public shiftTimeLine(px: number) {
    const timeAxis = this.getXAxis() as TimeAxis
    const shiftTime = (px / timeAxis.unitWidth) * timeAxis.getUnitTimeValue()
    this.shiftTimeLineByTime(shiftTime)
  }

  public shiftTimeLineByTime(shiftTime: number) {
    const timeAxis = this.getXAxis() as TimeAxis
    const fullTimeExtent = this.getTimeExtent()
    const shiftedMinTime = timeAxis.domainRange.getMinValue() + shiftTime
    if (shiftedMinTime <= fullTimeExtent[1]) {
      const offset = Math.max(fullTimeExtent[0], shiftedMinTime) - shiftedMinTime
      timeAxis.domainRange.shift(shiftTime + offset)
      this.updateTimeExtent()
    }
  }

  public locateTimeLine(timestamp: number) {
    const timeAxis = this.getXAxis() as TimeAxis
    const interval = timeAxis.domainRange.getInterval()
    const fullTimeExtent = this.getTimeExtent()
    const minTime = Math.max(fullTimeExtent[0], timestamp - interval / 2)
    timeAxis.domainRange.setMinValue(minTime).setMaxValue(minTime + interval)
    this.updateTimeExtent()
  }

  public updateTimeExtent() {
    this.setVisibleSeriesData()
    this.updateYExtend()
    this.update()
  }

  public updateYExtend() {
    const yExtent = this.getYExtent()
    const newCenter = (yExtent[0] + yExtent[1]) / 2
    const halfInterval = (yExtent[1] - yExtent[0]) / 2
    const scaleCoeff = this._yAxis.getScaleCoeff()
    this._yAxis.domainRange
      .setMinValue(newCenter - halfInterval * scaleCoeff)
      .setMaxValue(newCenter + halfInterval * scaleCoeff)
  }

  private initEvents() {
    this.on(`seriesData${CommonKeys.Change}`, () => {
      // transfer date string to timestamp number
      const seriesData = this.getSeriesData()
      seriesData.forEach((item: CandlestickItem) => {
        item.time = getTimestamp(item.time)
      })
      this.setAxis()
    })
    const canvas = this.getHitCanvas()
    canvas &&
      RegisterEvents.forEach((evt: any) => {
        canvas.addEventListener(evt, this.eventHandler.bind(this, evt))
      })
    window.addEventListener('resize', this.resize.bind(this))
  }

  private eventHandler(eventType: string, e: MouseEvent) {
    const eventActions = {
      mousedown: this.onmousedown,
      mousemove: this.onmousemove,
      wheel: this.onmousewheel,
      mouseup: this.onmouseup,
      mouseout: this.onmouseout,
    }
    const point: Point = geElementOffsetFromParent(e)
    const evt = { point, originEvent: e }
    if ((eventActions as any)[eventType]) {
      ;(eventActions as any)[eventType].call(this, evt)
    }
    e.stopPropagation()
    e.preventDefault()
  }

  private onmousedown(evt: any) {
    this.eachWidgets((widget: IWidget) => {
      const isContain = widget.contain(evt.point)
      if (isContain) {
        widget.fire('mousedown', evt)
      }
      widget.setAttr('isMousedown', isContain)
    })
  }

  private onmousemove(evt: any) {
    let isMoveToWidget: boolean = false
    this.eachWidgets((widget: IWidget) => {
      const isMouseover = widget.getAttr('isMouseover')
      if (widget.contain(evt.point)) {
        isMoveToWidget = true
        if (!isMouseover) {
          widget.fire('mouseover', evt)
        }
        widget.fire('mousemove', evt)
        !isMouseover && widget.setAttr('isMouseover', true)
      } else if (isMouseover) {
        widget.fire('mouseout', evt)
        widget.setAttr('isMouseover', false)
      }
    })
    if (!isMoveToWidget) {
      setElementStyle(this.getHitCanvas(), { cursor: 'default' })
    }
  }

  private onmouseup(evt: any) {
    this.eachWidgets((widget: IWidget) => {
      if (widget.contain(evt.point)) {
        widget.fire('mouseup', evt)
      }
    })
  }

  private onmouseout() {
    this.eachWidgets((widget: IWidget) => {
      if (widget.getAttr('isMouseover')) {
        widget.setAttr('isMouseover', false)
        widget.fire('mouseout')
      }
    })
  }

  private onmousewheel(evt: any) {
    this.eachWidgets((widget: IWidget) => {
      if (widget.contain(evt.point)) {
        widget.fire('mousewheel', evt)
      }
    })
  }
}
