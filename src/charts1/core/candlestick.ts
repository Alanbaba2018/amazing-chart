/* eslint-disable max-lines*/
import BaseView from './baseView'
import BasePanel from './basePanel'
import IWidget from './widgets/iWidget'
import TimeAxisWidget from './widgets/time-axis-widget'
import TimelineWidget from './widgets/timeline-widget'
import GapWidget from './widgets/ext/gap-widget'
import Axis from '../model/axis'
import Range from '../model/range'
import TimeAxis from '../model/time-axis'
import Canvas from './canvas'
import {
  PanelOptions,
  CandlestickItem,
  Point,
  CommonKeys,
  RegisterEvents,
  ExtendView,
  PanelType,
  ViewType,
  AddViewTypes,
  DrawMode,
} from '../typeof/type'
import {
  createCanvasElement,
  geElementOffsetFromParent,
  setElementStyle,
  getTimestamp,
  getDevicePixelRatio,
} from '../util/helper'
import CandlestickOptions from './options'
import * as Indicator from './indicator'

export default class Candlestick extends BaseView {
  public config = { ...CandlestickOptions }

  protected _canvas: HTMLCanvasElement // main scene canvas

  protected _hitCanvas: HTMLCanvasElement

  protected _bgCanvas: HTMLCanvasElement // background canvas

  protected _ctx: CanvasRenderingContext2D

  protected _hitCtx: CanvasRenderingContext2D // hit-check of mouse canvas

  protected _bgCtx: CanvasRenderingContext2D

  protected _axisCanvas: HTMLCanvasElement // axis canvas

  protected _axisCtx: CanvasRenderingContext2D

  protected _staticCanvas: HTMLCanvasElement // almost unchange canvas

  protected _staticCtx: CanvasRenderingContext2D

  protected _frameCanvas: HTMLCanvasElement // ui frame canvas

  protected _frameCtx: CanvasRenderingContext2D

  protected _xAxis: Axis

  protected _baseWidgets: IWidget[] = []

  protected _extPanels: BasePanel[] = []

  protected _gapWidgets: GapWidget[] = []

  private _visibleViewHeight: number = 0

  public get visibleViewHeight(): number {
    return this._visibleViewHeight
  }

  public get gapWidgets(): GapWidget[] {
    return this._gapWidgets
  }

  public get extPanels(): BasePanel[] {
    return this._extPanels
  }

  constructor(options: PanelOptions) {
    super()
    this.setAttrs(options)
    this.initContainer()
    this.initWidgets()
    this.initEvents()
  }

  public getCanvasCollection(): HTMLCanvasElement[] {
    return [this._canvas, this._hitCanvas, this._bgCanvas, this._axisCanvas, this._staticCanvas, this._frameCanvas]
  }

  public getCanvas(): HTMLCanvasElement {
    return this._canvas
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas
    return this
  }

  public getHitCanvas(): HTMLCanvasElement {
    return this._hitCanvas
  }

  public setHitCanvas(canvas: HTMLCanvasElement) {
    this._hitCanvas = canvas
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

  public getFrameCanvas(): HTMLCanvasElement {
    return this._frameCanvas
  }

  public setFrameCanvas(canvas: HTMLCanvasElement) {
    this._frameCanvas = canvas
    return this
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
      this.setHitContext(this._hitCanvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._hitCtx
  }

  public setHitContext(ctx: CanvasRenderingContext2D) {
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

  public getFrameContext(): CanvasRenderingContext2D {
    if (!this._frameCtx) {
      this.setFrameContext(this._frameCanvas.getContext('2d') as CanvasRenderingContext2D)
    }
    return this._frameCtx
  }

  public setFrameContext(ctx: CanvasRenderingContext2D) {
    this._frameCtx = ctx
    return this
  }

  public getXAxis(): Axis {
    return this._xAxis
  }

  public resize() {
    const container = this.getAttr('container')
    if (!container) return
    this.setAttrs({ width: container.clientWidth, height: container.clientHeight })
    this.updateContainerSize()
    // this.eachPanels((widget: IWidget) => widget.setViewBound())
    const background = this.getAttr('background')
    background && this.setPanelBackground(background)
    this.update()
  }

  public clearPanel(drawMode: DrawMode) {
    const ctx = this.getContext()
    const axisCtx = this.getAxisContext()
    const staticCtx = this.getStaticContext()
    const frameCtx = this.getFrameContext()
    Canvas.clearRect(ctx)
    Canvas.clearRect(axisCtx)
    if (drawMode === DrawMode.All) {
      Canvas.clearRect(staticCtx)
      Canvas.clearRect(frameCtx)
    }
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
    const visibleData = this.getVisibleSeriesData()
    const values: number[] = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
      acc.push(...[cur.high, cur.low])
      return acc
    }, [])
    return [Math.min(...values), Math.max(...values)]
  }

  public getVisibleTimeExtent(): number[] {
    const visibleData = this.getVisibleSeriesData()
    const values: number[] = visibleData.map((rowData: CandlestickItem) => rowData.time)
    return [Math.min(...values), Math.max(...values)]
  }

  public getTimeExtent(): number[] {
    const seriesData: CandlestickItem[] = this.getSeriesData()
    const values: number[] = seriesData.map((rowData: CandlestickItem) => rowData.time)
    return [Math.min(...values), Math.max(...values)]
  }

  public setAxis() {
    const { yAxis, margin, width } = this.getConfig()
    const viewWidth = width - yAxis.width - margin.left - margin.right
    const xExtent = this.getVisibleTimeExtent()
    const visibleSeriesData = this.getVisibleSeriesData()
    this._xAxis = new TimeAxis(xExtent, [0, viewWidth], visibleSeriesData.length)
    this.setVisibleSeriesData()
  }

  public setVisibleSeriesData() {
    const unitValue = this._xAxis.getUnitTimeValue()
    const timeDomainRange = this._xAxis.domainRange
    // add and subtract one unitvalue to keep line continuely
    const extTimeRange = new Range(timeDomainRange.getMinValue() - unitValue, timeDomainRange.getMaxValue() + unitValue)
    const visibleData = this.getSeriesData().filter((item: CandlestickItem) => extTimeRange.contain(item.time))
    this.setAttr('visibleSeriesData', visibleData)
  }

  public initContainer() {
    const container = this.getAttr('container')
    if (!container) return
    this.setAttrs({ width: container.clientWidth, height: container.clientHeight })
    const { width = 0, height = 0 } = this.getConfig()
    const style = { position: 'absolute', left: 0, top: 0, width: `${width}px`, height: `${height}px` }
    this.setHitCanvas(createCanvasElement(width, height, { className: 'hit', style: { ...style, zIndex: 10 } }))
    this.setFrameCanvas(createCanvasElement(width, height, { className: 'frame', style: { ...style, zIndex: 9 } }))
    this.setAxisCanvas(createCanvasElement(width, height, { className: 'axis', style: { ...style, zIndex: 0 } }))
    this.setCanvas(createCanvasElement(width, height, { className: 'scene', style: { ...style, zIndex: -10 } }))
    this.setStaticCanvas(createCanvasElement(width, height, { className: 'static', style: { ...style, zIndex: -20 } }))
    this.setBgCanvas(createCanvasElement(width, height, { className: 'bg', style: { ...style, zIndex: -30 } }))
    this.addElemens([
      this.getBgCanvas(),
      this.getStaticCanvas(),
      this.getCanvas(),
      this.getAxisCanvas(),
      this.getFrameCanvas(),
      this.getHitCanvas(),
    ])
    const { background = 'transparent' } = this.getConfig()
    this.setPanelBackground(background)
  }

  public initWidgets() {
    const { margin, timeline, xAxis, height } = this.getConfig()
    this._visibleViewHeight = height - margin.top - margin.bottom - timeline.height - xAxis.height
    const basePanel = new BasePanel(PanelType.BASE, ViewType.CANDLE)
    const timeAxisWidget = new TimeAxisWidget()
    const timelineWidget = new TimelineWidget()
    this.initExtWidgets()
    this.addPanels([timeAxisWidget, timelineWidget, basePanel, ...this._gapWidgets, ...this._extPanels])
    this.initPanelBound()
  }

  public initExtWidgets() {
    const extendViews: ExtendView[] = this.getAttr('extends')
    let frontPanel: BasePanel | null = null
    extendViews.forEach(view => {
      if (AddViewTypes.includes(view.type)) {
        const extPanel = new BasePanel(PanelType.EXT, view.type, view.params, view.styles)
        const gapWidget = new GapWidget(frontPanel, extPanel)
        this._extPanels.push(extPanel)
        this._gapWidgets.push(gapWidget)
        frontPanel = extPanel
      }
    })
  }

  public updateContainerSize() {
    const canvasCollection = this.getCanvasCollection()
    const { width, height } = this.getConfig()
    this.setAttrs({ width, height })
    const styles = { width: `${width}px`, height: `${height}px` }
    canvasCollection.forEach((canvas: HTMLCanvasElement) => {
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
    const shiftedMaxTime = timeAxis.domainRange.getMaxValue() + shiftTime
    if (
      shiftedMinTime <= fullTimeExtent[1] &&
      shiftedMaxTime <= fullTimeExtent[1] + timeAxis.domainRange.getInterval() / 2
    ) {
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
    this.update(DrawMode.XAxis)
  }

  public updateYExtend() {
    this.eachPanels(panel => {
      if (panel instanceof BasePanel) {
        panel.updateYExtend()
      }
    })
  }

  public calculateExtendIndicators() {
    const seriesData = this.getSeriesData()
    const extendViews: ExtendView[] = this.getAttr('extends')
    if (extendViews && extendViews.length > 0) {
      extendViews.forEach(view => {
        Indicator[view.type] && Indicator[view.type].calculate(seriesData, view.params)
      })
    }
  }

  private initEvents() {
    this.on(`seriesData${CommonKeys.Change}`, () => {
      // transfer date string to timestamp number
      const seriesData = this.getSeriesData()
      seriesData.forEach(item => {
        item.time = getTimestamp(item.time)
      })
      this.calculateExtendIndicators()
      this.setAxis()
      this.initPanelYAxis()
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
    const doHandle = (widget: IWidget) => {
      const isContain = widget.contain(evt.point)
      if (isContain) {
        widget.fire('mousedown', evt)
      }
      widget.setAttr('isMousedown', isContain)
    }
    this.eachPanels(panel => {
      if (panel instanceof BasePanel && panel.contain(evt.point)) {
        panel.eachWidgets(widget => doHandle(widget))
      } else {
        doHandle(panel)
      }
    })
  }

  private onmousemove(evt: any) {
    let isMoveToWidget: boolean = false
    const doHandle = (widget: IWidget) => {
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
    }
    this.eachPanels(panel => {
      if (panel instanceof BasePanel && panel.contain(evt.point)) {
        panel.eachWidgets(widget => doHandle(widget))
      } else {
        doHandle(panel)
      }
    })
    if (!isMoveToWidget) {
      setElementStyle(this.getHitCanvas(), { cursor: 'default' })
    }
  }

  private onmouseup(evt: any) {
    const doHandle = (widget: IWidget) => {
      if (widget.contain(evt.point)) {
        widget.fire('mouseup', evt)
      }
    }
    this.eachPanels(panel => {
      if (panel instanceof BasePanel && panel.contain(evt.point)) {
        panel.eachWidgets(widget => doHandle(widget))
      } else {
        doHandle(panel)
      }
    })
  }

  private onmouseout() {
    const doHandle = (widget: IWidget) => {
      if (widget.getAttr('isMouseover')) {
        widget.setAttr('isMouseover', false)
        widget.fire('mouseout')
      }
    }
    this.eachPanels(panel => {
      if (panel instanceof BasePanel) {
        panel.eachWidgets(widget => doHandle(widget))
      } else {
        doHandle(panel)
      }
    })
  }

  private onmousewheel(evt: any) {
    const doHandle = (widget: IWidget) => {
      if (widget.contain(evt.point)) {
        widget.fire('mousewheel', evt)
      }
    }
    this.eachPanels(panel => {
      if (panel instanceof BasePanel && panel.contain(evt.point)) {
        panel.eachWidgets(widget => doHandle(widget))
      } else {
        doHandle(panel)
      }
    })
  }
}
