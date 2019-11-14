/* eslint-disable max-lines*/
import BaseView from './baseView'
import IPanel from './widgets/IPanel'
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
  PanelType,
  ViewType,
  DrawMode,
  CommonObject,
} from '../typeof/type'
import { RegisterEvents, AddViewTypes } from '../typeof/constant'
import { createCanvasElement, geElementOffsetFromParent, setElementStyle } from '../util/helper'
import CandlestickOptions from './options'
import * as Indicator from './indicator'
import { isString } from '../util/type-check'
import EventProxy from './eventProxy'
import * as G from '../indicator'

export default class Candlestick extends BaseView {
  protected defaultConfig = { ...CandlestickOptions }

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

  private _visibleViewHeight: number = 0

  private _maxTimestamp: number = 0

  public get visibleViewHeight(): number {
    return this._visibleViewHeight
  }

  public get gapWidgetsLength(): number {
    return this.filterPanels(panel => panel instanceof GapWidget).length
  }

  public get iPanels(): IPanel[] {
    return this.filterPanels(panel => panel instanceof IPanel) as IPanel[]
  }

  constructor(options: PanelOptions) {
    super()
    this.setAttrs({ ...this.defaultConfig, ...options })
    this.initContainer()
    this.initWidgets()
    this.initEvents()
    this.initialData()
    console.log(G)
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

  public getMaxTimestamp(): number {
    return this._maxTimestamp
  }

  public resize() {
    const container = this.getAttr('container')
    if (!container) return
    const { width: oldWidth, height: oldHeight } = this.getConfig()
    this.setAttrs({ width: container.clientWidth, height: container.clientHeight })
    const { width: newWidth, height: newHeight } = this.getConfig()
    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      // stash previous center timestamp
      const timeDomain = this._xAxis.domainRange
      const centerTime = (timeDomain.getMinValue() + timeDomain.getMaxValue()) / 2
      this.updateContainerSize()
      this.setAxis(centerTime)
      this.resizeAllPanelBound()
    }
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
    const devicePixelRatio = this.getAttr('devicePixelRatio')
    if (ctx) {
      ctx.save()
      ctx.scale(devicePixelRatio, devicePixelRatio)
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

  public setAxis(centerTime?: number) {
    const { yAxis, margin, width } = this.getConfig()
    const viewWidth = width - yAxis.width - margin.left - margin.right
    const xExtent = this.getTimeExtent()
    const [, maxTime] = xExtent
    this._maxTimestamp = maxTime
    const seriesData = this.getSeriesData()
    this._xAxis = new TimeAxis(xExtent, [0, viewWidth], seriesData.length)
    centerTime = centerTime || this._maxTimestamp
    this.setTimeAxisCenter(centerTime)
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
    const basePanel = new IPanel(PanelType.BASE, ViewType.CANDLE)
    const timeAxisWidget = new TimeAxisWidget()
    const timelineWidget = new TimelineWidget()
    const extPanels: Array<IPanel | IWidget> = this.getIndicatorPanels(basePanel)
    this.addPanels([timeAxisWidget, timelineWidget, basePanel, ...extPanels])
    this.initPanelBound()
  }

  public getIndicatorPanels(basePanel: IPanel): Array<IPanel | IWidget> {
    const indicatorViews = this.getAttr('indicators') || []
    const extPanels: Array<IPanel | IWidget> = []
    let frontPanel: IPanel = basePanel
    indicatorViews.forEach(view => {
      this._indicatorViews.set(view.type, view)
      if (AddViewTypes.includes(view.type)) {
        const extPanel = new IPanel(PanelType.EXT, view.type, view.params, view.styles)
        const gapWidget = new GapWidget(frontPanel, extPanel)
        extPanels.push(gapWidget, extPanel)
        frontPanel = extPanel
      }
    })
    return extPanels
  }

  public updateContainerSize() {
    const canvasCollection = this.getCanvasCollection()
    const { width, height } = this.getConfig()
    this.setAttrs({ width, height })
    const styles = { width: `${width}px`, height: `${height}px` }
    const devicePixelRatio = this.getAttr('devicePixelRatio')
    canvasCollection.forEach((canvas: HTMLCanvasElement) => {
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      setElementStyle(canvas, styles)
    })
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
    this.setTimeAxisCenter(timestamp)
    this.updateTimeExtent()
  }

  public addOrUpdateLastData(item: { t: number; o: string; h: string; c: string; l: string; v: string }) {
    const seriesData = this.getAttr('seriesData')
    const addItem = { time: item.t, open: item.o, close: item.c, high: item.h, low: item.l, volume: item.v }
    this.formatItem(addItem)
    const lastItem = seriesData[seriesData.length - 1]
    if (lastItem.time !== addItem.time) {
      seriesData.push(addItem)
      if (this._xAxis.domainRange.contain(addItem.time)) {
        this.calculateIndicators()
        this.shiftTimeLineByTime(this._xAxis.getUnitTimeValue())
        return
      }
    } else {
      Object.assign(lastItem, addItem)
    }
    this.calculateIndicators()
    this.updateYExtend()
    this.update()
  }

  public setTimeAxisCenter(centerTime: number) {
    const timeAxis = this.getXAxis() as TimeAxis
    const interval = timeAxis.domainRange.getInterval()
    const fullTimeExtent = this.getTimeExtent()
    const minTime = Math.max(fullTimeExtent[0], centerTime - interval / 2)
    timeAxis.domainRange.setMinValue(minTime).setMaxValue(minTime + interval)
  }

  public updateTimeExtent() {
    this.setVisibleSeriesData()
    this.updateYExtend()
    this.update(DrawMode.XAxis)
  }

  public updateYExtend() {
    this.eachPanels(panel => {
      if (panel instanceof IPanel) {
        panel.updateYExtend()
      }
    })
  }

  public calculateIndicators() {
    const seriesData = this.getSeriesData()
    if (this._indicatorViews.size > 0) {
      const indicatorViews = Array.from(this._indicatorViews.values())
      indicatorViews.forEach(view => {
        Indicator[view.type] && Indicator[view.type].calculate(seriesData, view.params)
      })
    }
  }

  /* close chart panel */
  public closeIndicatorPanel(panel: IPanel | string) {
    /* first: find panels related width target
    second: update frontPanel and nextPanel of gapWidget
    */
    let closePanel: IPanel | string = ''
    if (isString(panel)) {
      const tPanel = this.panels.find(ipanel => ipanel instanceof IPanel && ipanel.viewName === panel) as IPanel
      closePanel = tPanel || panel
    }
    if (isString(closePanel)) {
      this._indicatorViews.delete(closePanel as string)
    } else {
      let frontGap!: GapWidget
      let nextGap!: GapWidget
      const panelSets: Set<IPanel | IWidget> = new Set([closePanel as IPanel])
      const gapWidgets = this.filterPanels(ipanel => ipanel instanceof GapWidget) as GapWidget[]
      for (let i = 0; i < gapWidgets.length; i++) {
        const currentGap = gapWidgets[i]
        if (currentGap.nextPanel === closePanel) {
          frontGap = currentGap
        }
        if (currentGap.frontPanel === closePanel) {
          nextGap = currentGap
        }
      }
      // is Middle panel
      if (nextGap) {
        panelSets.add(nextGap)
        frontGap.nextPanel = nextGap.nextPanel
      } else {
        panelSets.add(frontGap)
      }
      this.removePanels(panelSets)
      this.updatePanelBound()
    }
    this.update()
  }

  public addIndicatorPanel(type: ViewType, params: CommonObject, styles: CommonObject = {}) {
    this._indicatorViews.set(type, { type, params, styles })
    if (AddViewTypes.includes(type)) {
      let frontPanel!: IPanel
      // find last IPanel
      for (let i = this.panels.length - 1; i >= 0; i--) {
        const currentPanel = this.panels[i]
        if (currentPanel instanceof IPanel) {
          frontPanel = currentPanel
          break
        }
      }
      const extPanel = new IPanel(PanelType.EXT, type, params, styles)
      const gapWidget = new GapWidget(frontPanel, extPanel)
      this.addPanels([gapWidget, extPanel])
      this.calculateIndicators()
      this.updatePanelBound()
    }
    this.update()
  }

  private initialData() {
    const seriesData = this.getSeriesData()
    if (seriesData.length > 0) {
      seriesData.forEach(this.formatItem)
      this.calculateIndicators()
      this.setAxis()
      this.initPanelYAxis()
    }
  }

  private initEvents() {
    this.on(`seriesData${CommonKeys.Change}`, () => {
      // transfer date string to timestamp number
      this.initialData()
    })
    const canvas = this.getHitCanvas()
    canvas &&
      RegisterEvents.forEach((evt: any) => {
        EventProxy.on(canvas, evt, this.eventHandler.bind(this, evt))
        // canvas.addEventListener(evt, this.eventHandler.bind(this, evt))
      })
    window.addEventListener('resize', this.resize.bind(this))
  }

  private eventHandler(eventType: string, e: any) {
    const eventActions = {
      click: this.onclick,
      mousedown: this.onmousedown,
      mousemove: this.onmousemove,
      wheel: this.onmousewheel,
      mouseup: this.onmouseup,
      mouseout: this.onmouseout,
    }
    const point: Point = geElementOffsetFromParent(e)
    const evt = { point, originEvent: e }
    if ((eventActions as CommonObject)[eventType]) {
      ;(eventActions as CommonObject)[eventType].call(this, evt)
    }
    e.originEvent ? e.originEvent.stopPropagation() : e.stopPropagation()
    e.originEvent ? e.originEvent.preventDefault() : e.preventDefault()
  }

  private onclick(evt: CommonObject) {
    const doHandle = (panel: IWidget | IPanel) => {
      const isContain = panel.contain(evt.point)
      if (isContain) {
        panel instanceof IPanel && panel.eachWidgets(doHandle)
        panel.fire('click', evt)
      }
    }
    this.eachPanels(doHandle)
  }

  private onmousedown(evt: CommonObject) {
    const doHandle = (panel: IWidget | IPanel) => {
      const isContain = panel.contain(evt.point)
      if (isContain) {
        panel instanceof IPanel && panel.eachWidgets(doHandle)
        panel.fire('mousedown', evt)
      }
      panel.setAttr('isMousedown', isContain)
    }
    this.eachPanels(doHandle)
    this.fire('mousedown', evt)
  }

  private onmousemove(evt: CommonObject) {
    let isMoveToWidget: boolean = false
    const doHandle = (panel: IWidget | IPanel) => {
      panel instanceof IPanel && panel.eachWidgets(doHandle)
      const isMouseover = panel.getAttr('isMouseover')
      if (panel.contain(evt.point)) {
        isMoveToWidget = true
        if (!isMouseover) {
          panel.fire('mouseover', evt)
        }
        // mousemove check prop 'isMouseover', when it's false so setting mouse style
        panel.fire('mousemove', evt)
        panel.setAttr('isMouseover', true)
      } else if (isMouseover) {
        panel.fire('mouseout', evt)
        panel.setAttr('isMouseover', false)
      }
    }
    this.eachPanels(doHandle)
    this.fire('mousemove', evt)
    if (!isMoveToWidget) {
      setElementStyle(this.getHitCanvas(), { cursor: 'default' })
    }
  }

  private onmouseup(evt: any) {
    const doHandle = (panel: IWidget | IPanel) => {
      if (panel.contain(evt.point)) {
        panel instanceof IPanel && panel.eachWidgets(doHandle)
        panel.fire('mouseup', evt)
      }
    }
    this.eachPanels(doHandle)
    this.fire('mouseup', evt)
  }

  private onmouseout() {
    const doHandle = (widget: IWidget) => {
      if (widget.getAttr('isMouseover')) {
        widget.setAttr('isMouseover', false)
        widget.fire('mouseout')
      }
    }
    this.eachPanels(doHandle)
  }

  private onmousewheel(evt: CommonObject) {
    const doHandle = (panel: IWidget | IPanel) => {
      if (panel.contain(evt.point)) {
        panel instanceof IPanel && panel.eachWidgets(doHandle)
        panel.fire('mousewheel', evt)
      }
    }
    this.eachPanels(doHandle)
    this.fire('mousewheel', evt)
  }

  private formatItem(item: CommonObject) {
    ;['time', 'open', 'high', 'low', 'close', 'volume'].forEach(key => {
      item[key] = Number(item[key])
    })
  }
}
