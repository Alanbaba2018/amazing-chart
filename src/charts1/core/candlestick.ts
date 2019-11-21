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
  CommonKeys,
  PanelType,
  IndicatorType,
  DrawMode,
  CommonObject,
} from '../typeof/type'
import { RegisterEvents } from '../typeof/constant'
import { createCanvasElement, geElementOffsetFromParent, setElementStyle, isZero } from '../util/helper'
import CandlestickOptions from './options'
import Indicator from './indicator'
import { isString } from '../util/type-check'
import EventProxy from './eventProxy'

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
      // to keep center time unchang
      this.setTimeAxis(centerTime)
      this.setVisibleViewHeight()
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

  public setTimeAxis(centerTime?: number) {
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
    this.setVisibleViewHeight()
    const basePanel = new IPanel(PanelType.BASE, { indicatorType: IndicatorType.CANDLE, isScaleCenter: true })
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
      const indicatorType = view.type
      if (!Indicator[indicatorType]) return
      const { defaultProps } = Indicator[indicatorType]
      const options = { params: {}, ...view, indicatorType, ...defaultProps }
      this._indicatorViews.set(view.type, options)
      if (!defaultProps.isHistBase) {
        const extPanel = new IPanel(PanelType.EXT, options)
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

  public zoomIn(timeValue?: number) {
    if (timeValue === undefined) {
      timeValue = this._xAxis.domainRange.getCenter()
    }
    this.zoom(timeValue, 1)
  }

  public zoomOut(timeValue?: number) {
    if (timeValue === undefined) {
      timeValue = this._xAxis.domainRange.getCenter()
    }
    this.zoom(timeValue, -1)
  }

  public addOrUpdateLastData(item: { t: number; o: string; h: string; c: string; l: string; v: string }) {
    const seriesData = this.getAttr('seriesData')
    const addItem = { time: item.t, open: item.o, close: item.c, high: item.h, low: item.l, volume: item.v }
    this.formatItem(addItem)
    const lastItem = seriesData[seriesData.length - 1]
    if (lastItem.time !== addItem.time) {
      seriesData.push(addItem)
      if (this._xAxis.domainRange.contain(addItem.time)) {
        this.shiftTimeLineByTime(this._xAxis.getUnitTimeValue())
        return
      }
    } else {
      Object.assign(lastItem, addItem)
    }
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

  public closeIndicatorPanel(panel: IPanel | string) {
    /* first: find panels related width target
    second: update frontPanel and nextPanel of gapWidget
    */
    let closePanel: IPanel | string = ''
    if (isString(panel)) {
      const tPanel = this.panels.find(ipanel => {
        const indicatorType = ipanel.getAttr('indicatorType')
        return ipanel instanceof IPanel && indicatorType === panel
      }) as IPanel
      closePanel = tPanel
    } else {
      closePanel = panel
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

  public addIndicatorPanel(type: IndicatorType, params: CommonObject, styles: CommonObject = {}) {
    if (!Indicator[type]) return
    const { defaultProps } = Indicator[type]
    this._indicatorViews.set(type, { type, params, styles, ...defaultProps })
    if (!defaultProps.isHistBase) {
      let frontPanel!: IPanel
      // find last IPanel
      for (let i = this.panels.length - 1; i >= 0; i--) {
        const currentPanel = this.panels[i]
        if (currentPanel instanceof IPanel) {
          frontPanel = currentPanel
          break
        }
      }
      const extPanel = new IPanel(PanelType.EXT, { indicatorType: type, params, styles })
      const gapWidget = new GapWidget(frontPanel, extPanel)
      this.addPanels([gapWidget, extPanel])
      this.updatePanelBound()
    }
    this.update()
  }

  public setCurrentTime(timeValue: number) {
    requestAnimationFrame(() => {
      this.eachPanels(panel => panel instanceof IPanel && panel.updateDetailLabel(timeValue))
    })
  }

  public destroy() {}

  private zoom(timeValue: number, level: number) {
    if (level !== 1 && level !== -1) return
    const { scaleRatio } = this.getAttr('xAxis')
    // deltaY > 0 ? 1.05 : 0.95;
    // zoomIn and zoomOut should be reciprocal relationship
    const coeff: number = (1 + scaleRatio) ** level
    const timeAxis = this._xAxis as TimeAxis
    const oldScaleCoeff = timeAxis.getCurrentScaleCoeff()
    timeAxis.scaleAroundTimestamp(timeValue, coeff)
    const fullTimeExtent = this.getTimeExtent()
    const timeRange = timeAxis.domainRange
    const currentInterval = timeRange.getInterval()
    // some border condition should be limited
    if (timeRange.getMinValue() > fullTimeExtent[1]) {
      timeRange.setMinValue(fullTimeExtent[1]).setMaxValue(fullTimeExtent[1] + currentInterval)
    }
    if (timeRange.getMinValue() < fullTimeExtent[0] || timeRange.getMaxValue() < fullTimeExtent[0]) {
      timeRange.setMinValue(fullTimeExtent[0]).setMaxValue(fullTimeExtent[0] + currentInterval)
    }
    // when scale origin maxTime more than current scale middle time
    if (timeRange.getCenter() > fullTimeExtent[1]) {
      timeRange
        .setMinValue(fullTimeExtent[1] - currentInterval / 2)
        .setMaxValue(fullTimeExtent[1] + currentInterval / 2)
    }
    const newScaleCoeff = timeAxis.getCurrentScaleCoeff()
    if (!isZero(oldScaleCoeff - newScaleCoeff)) {
      this.updateTimeExtent()
    }
  }

  private setVisibleViewHeight() {
    const { margin, timeline, xAxis, height } = this.getConfig()
    this._visibleViewHeight = height - margin.top - margin.bottom - timeline.height - xAxis.height
  }

  private initialData() {
    const seriesData = this.getSeriesData()
    if (seriesData.length > 0) {
      seriesData.forEach(this.formatItem)
      this.setTimeAxis()
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
      })
    EventProxy.on(window, 'resize', this.resize.bind(this))
  }

  private eventHandler(eventType: string, evt: { originEvent: Event; [k: string]: any }) {
    if (!this._xAxis) return
    const eventActions = {
      click: this.onclick,
      mousedown: this.onmousedown,
      mousemove: this.onmousemove,
      wheel: this.onmousewheel,
      mouseup: this.onmouseup,
      mouseout: this.onmouseout,
    }
    const { originEvent } = evt
    if (evt.clientX !== undefined && evt.clientY !== undefined) {
      evt.point = geElementOffsetFromParent({ ...evt, target: originEvent.target })
    }
    if ((eventActions as CommonObject)[eventType]) {
      ;(eventActions as CommonObject)[eventType].call(this, evt)
    }
    originEvent.stopPropagation()
    originEvent.preventDefault()
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
