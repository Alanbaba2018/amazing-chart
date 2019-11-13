/* eslint-disable max-lines*/
import IBound from './iBound'
import IWidget from './iWidget'
import Candlestick from '../candlestick'
import {
  Bound,
  PanelType,
  CandlestickItem,
  ViewType,
  CommonObject,
  StandardBar,
  DrawMode,
  Point,
  ChartType,
} from '../../typeof/type'
import { GapWidgetHeight } from '../../typeof/constant'
import Canvas from '../canvas'
import Axis from '../../model/axis'
import FixAxis from '../../model/fix-axis'
import CandlestickWidget from './candlestick-widget'
import PriceAxisWidget from './price-axis-widget'
import ExtChartWidget from './ext/ext-chart-widget'
import * as Indicator from '../indicator'
import { isNumber } from '../../util/type-check'
import { setElementStyle, isBoundContain } from '../../util/helper'

export default class IPanel extends IBound {
  public widgets: IWidget[] = []

  private defaultConfig = { iconSize: 10, margin: 5 }

  private _isWaiting: boolean = false

  private _parent: Candlestick

  private _panelType: PanelType

  private _title: string = ''

  private _viewName: ViewType

  private _chartType: ChartType

  private _weight: number = 1

  private _yAxis: Axis

  public get yAxis(): Axis {
    return this._yAxis
  }

  public get panelType(): PanelType {
    return this._panelType
  }

  public get viewName(): ViewType {
    return this._viewName
  }

  public get chartType(): ChartType {
    return this._chartType
  }

  public get weight(): number {
    return this._weight
  }

  public get title(): string {
    return this._title
  }

  public get xAxis(): Axis {
    return this.getParent().getXAxis()
  }

  constructor(panelType: PanelType, viewName: ViewType, params: CommonObject = {}, styles: CommonObject = {}) {
    super()
    this._panelType = panelType
    this._viewName = viewName
    this._chartType = Indicator[this._viewName] && Indicator[this._viewName].type
    this.setAttrs({ params, styles, ...this.defaultConfig })
    this._initWidgets()
    this._initEvents()
  }

  public setYAxis() {
    const yExtent = this._getYExtent()
    if (this._chartType === ChartType.Standard) {
      this._yAxis = new FixAxis([0, yExtent[1]], [0, this.bound.height])
    } else {
      this._yAxis = new Axis(yExtent, [0, this.bound.height])
    }
  }

  public getSeriesData() {
    const { seriesData = [] } = this._parent.getConfig()
    return seriesData
  }

  public getVisibleSeriesData() {
    return this._parent.getAttr('visibleSeriesData') || this.getSeriesData()
  }

  public setParent(parent: Candlestick) {
    if (this._parent) {
      throw new Error('Current Node had parent, Pls do not set parent repeatly!')
    }
    this._parent = parent
  }

  public getParent(): Candlestick {
    return this._parent
  }

  public addWidget(widget: IWidget) {
    widget.setParent(this)
    this.widgets.push(widget)
    return this
  }

  public addWidgets(widgets: IWidget[]) {
    widgets.forEach(widget => {
      widget.setParent(this)
      this.widgets.push(widget)
    })
    return this
  }

  public eachWidgets(callback: Function) {
    this.widgets.forEach(widget => {
      callback.call(this, widget)
    })
  }

  public setViewBound() {
    const parent = this.getParent()
    const { margin, width } = parent.getConfig()
    const { visibleViewHeight, gapWidgetsLength, iPanels } = parent
    if (iPanels.length > 1) {
      this._weight = this.panelType === PanelType.BASE ? 0.7 : 0.3
    }
    const viewHeight = (visibleViewHeight - GapWidgetHeight * gapWidgetsLength) * this._weight
    let frontPanelY = margin.top
    for (let i = 0; i < iPanels.length; i++) {
      const currentPanel = iPanels[i]
      if (this === currentPanel) {
        break
      }
      frontPanelY = currentPanel.bound.y + GapWidgetHeight
    }
    this.setBound({
      x: margin.left,
      y: frontPanelY + viewHeight,
      width: width - margin.left - margin.right,
      height: viewHeight,
    })
    this.updateWidgetsBound()
  }

  public updateViewBound(allWeight: number = 1) {
    this._weight /= allWeight
    this.setBound(this.getUpdatedBound())
    this.updateWidgetsBound()
    this.setYAxis()
  }

  public updateViewBoundHeight(dh: number, dy: number) {
    const parent = this.getParent()
    const { visibleViewHeight, gapWidgetsLength } = parent
    const clearHeight = visibleViewHeight - GapWidgetHeight * gapWidgetsLength
    const updatedHeight = this.bound.height + dh
    this._weight = updatedHeight / clearHeight
    this.setBound({ ...this.bound, y: this.bound.y + dy, height: updatedHeight })
    this.updateWidgetsBound()
    this.setYAxis()
    parent.update()
  }

  public updateWidgetsBound() {
    this.eachWidgets((widget: IWidget) => widget.setViewBound())
  }

  public update(drawMode: DrawMode = DrawMode.YAxis) {
    if (this._isWaiting) {
      return
    }
    this._isWaiting = true
    requestAnimationFrame(() => {
      this.clearPanel(drawMode)
      this.widgets.forEach(widget => {
        widget.render(drawMode)
      })
      this._isWaiting = false
    })
  }

  public updateImmediate(drawMode: DrawMode) {
    this.clearPanel()
    this.widgets.forEach(widget => {
      widget.render(drawMode)
    })
  }

  public removeWidget(widget: IWidget) {
    for (let i = 0; i < this.widgets.length; i++) {
      if (this.widgets[i] === widget) {
        this.widgets.splice(i, 1)
        break
      }
    }
    return this
  }

  public updateYExtend() {
    const yExtent = this._getYExtent()
    const newCenter = (yExtent[0] + yExtent[1]) / 2
    const halfInterval = (yExtent[1] - yExtent[0]) / 2
    const scaleCoeff = this._yAxis.getScaleCoeff()
    if (this._chartType === ChartType.Standard) {
      this._yAxis.domainRange.setMinValue(0).setMaxValue(halfInterval * 2 * scaleCoeff)
    } else {
      this._yAxis.domainRange
        .setMinValue(newCenter - halfInterval * scaleCoeff)
        .setMaxValue(newCenter + halfInterval * scaleCoeff)
    }
  }

  public clearPanel(drawMode: DrawMode = DrawMode.YAxis) {
    const sceneCtx = this._parent.getContext()
    const axisCtx = this._parent.getAxisContext()
    const frameCtx = this._parent.getFrameContext()
    const ctxs = [sceneCtx, axisCtx]
    if (drawMode !== DrawMode.YAxis) {
      ctxs.push(frameCtx)
    }
    const { x, y, width, height } = this.bound
    const devicePixelRatio = this.getAttr('devicePixelRatio')
    const clearBound = {
      x,
      y: (y - height) * devicePixelRatio,
      width: width * devicePixelRatio,
      height: height * devicePixelRatio,
    }
    ctxs.forEach(ctx => Canvas.clearRect(ctx, clearBound))
  }

  public getCloseIconBound(): Bound {
    const { margin = 10, iconSize = 40 } = this.getConfig()
    return {
      x: this.bound.width - margin - iconSize,
      y: this.bound.height - margin - iconSize,
      width: iconSize,
      height: iconSize,
    }
  }

  public getCustomBarDatas(key: string): StandardBar[] {
    const barDatas: StandardBar[] = []
    const visibleData = this.getVisibleSeriesData()
    const parent = this.getParent()
    const { barWeight = 0.3 } = parent.getAttr('candlestick')
    const unitWidth = this.xAxis.unitWidth * barWeight
    const zeroCoord = this.yAxis.getCoordOfValue(0)
    visibleData.forEach(item => {
      if (item[key]) {
        const y = this.yAxis.getCoordOfValue(item[key])
        const x = this.xAxis.getCoordOfValue(item.time)
        barDatas.push({
          x: x - unitWidth,
          y,
          width: unitWidth * 2,
          height: y - zeroCoord,
        })
      }
    })
    return barDatas
  }

  public getStandardBarDatas(key: string): StandardBar[] {
    const barDatas: StandardBar[] = []
    const visibleData = this.getVisibleSeriesData()
    const parent = this.getParent()
    const { barWeight = 0.3 } = parent.getAttr('candlestick')
    const unitWidth = this.xAxis.unitWidth * barWeight
    visibleData.forEach(item => {
      if (item[key]) {
        const x = this.xAxis.getCoordOfValue(item.time)
        const y = this.yAxis.getCoordOfValue(item[key])
        barDatas.push({
          x: x - unitWidth,
          y: -y,
          width: unitWidth * 2,
          height: y,
        })
      }
    })
    return barDatas
  }

  public getLineDatas(key: string): Point[] {
    const lineDatas: Point[] = []
    const visibleData = this.getVisibleSeriesData()
    visibleData.forEach(item => {
      if (item[key]) {
        const y = this.yAxis.getCoordOfValue(item[key])
        const x = this.xAxis.getCoordOfValue(item.time)
        lineDatas.push({ x, y: -y })
      }
    })
    return lineDatas
  }

  public isHoverCloseIcon(viewPoint: Point): boolean {
    if (!this.bound.width) {
      return false
    }
    const closeBound = this.getCloseIconBound()
    return isBoundContain(closeBound, viewPoint)
  }

  private getUpdatedBound(): Bound {
    const parent = this.getParent()
    const { width, margin } = parent.getConfig()
    const { visibleViewHeight, gapWidgetsLength, iPanels } = parent
    const clearHeight = visibleViewHeight - GapWidgetHeight * gapWidgetsLength
    let y = 0
    for (let i = 0; i < iPanels.length; i++) {
      const currentPanel = iPanels[i]
      if (currentPanel === this) {
        break
      }
      y += currentPanel.bound.height + GapWidgetHeight
    }
    const height = clearHeight * this._weight
    const viewWidth = width - margin.left - margin.right
    y += height
    return { ...this.bound, y, height, width: viewWidth }
  }

  private _initWidgets() {
    const priceAxisWidget = new PriceAxisWidget()
    if (this._panelType === PanelType.BASE) {
      const candlewWidget = new CandlestickWidget()
      this.addWidgets([candlewWidget, priceAxisWidget])
    } else {
      const extWidget = new ExtChartWidget()
      this.addWidgets([extWidget, priceAxisWidget])
    }
  }

  private _initEvents() {
    this.on('mousemove', this._onmousemove.bind(this))
    this.on('click', this._onclick.bind(this))
  }

  private _onclick(evt: CommonObject) {
    const parent = this.getParent()
    const viewPoint = this.transformPointToView(evt.point)
    if (this.isHoverCloseIcon(viewPoint)) {
      parent.closePanel(this)
    }
  }

  private _onmousemove(evt: CommonObject) {
    const parent = this.getParent()
    const viewPoint = this.transformPointToView(evt.point)
    if (this.isHoverCloseIcon(viewPoint)) {
      setElementStyle(parent.getHitCanvas(), { cursor: 'pointer' })
    }
  }

  private _getYExtent(): number[] {
    const visibleData = this.getVisibleSeriesData()
    let values: number[] = []
    const { MACD, ATR } = Indicator
    const params = this.getAttr('params')
    switch (this._viewName) {
      case ViewType.CANDLE:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          acc.push(...[cur.high, cur.low])
          return acc
        }, [])
        break
      case ViewType.MACD:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          const indicators = [cur[MACD.key], cur[MACD.oscillatorKey], cur[MACD.signalKey]].filter(isNumber)
          acc.push(...indicators)
          return acc
        }, [])
        this._title = `${MACD.title} (${params.longPeriod}, ${params.shortPeriod}, ${params.signalPeriod})`
        break
      case ViewType.ATR:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          const indicators = params.periods.map(perid => cur[`${ATR.key}${perid}`]).filter(isNumber)
          acc.push(...indicators)
          return acc
        }, [])
        this._title = `${ATR.title} (${params.periods.join(', ')})`
        break
      case ViewType.VOL:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          acc.push(cur.volume)
          return acc
        }, [])
        values.push(0)
        this._title = 'VOL'
        break
      default:
        break
    }
    return [Math.min(...values), Math.max(...values)]
  }
}
