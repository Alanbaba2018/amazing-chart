import EventHandle from './eventHandle'
import IWidget from './widgets/iWidget'
import Candlestick from './candlestick'
import {
  Bound,
  PanelType,
  CandlestickItem,
  ViewType,
  GapWidgetHeight,
  CommonObject,
  StandardBar,
  DrawMode,
  Point,
} from '../typeof/type'
import Canvas from './canvas'
import Axis from '../model/axis'
import CandlestickWidget from './widgets/candlestick-widget'
import PriceAxisWidget from './widgets/price-axis-widget'
import ExtChartWidget from './widgets/ext/ext-chart-widget'
import * as Indicator from './indicator'
import { isNumber } from '../util/type-check'

export default class BasePanel extends EventHandle {
  public widgets: IWidget[] = []

  private defaultConfig = { iconSize: 12, margin: 8 }

  private _isWaiting: boolean = false

  private _parent: Candlestick

  private _panelType: PanelType

  private _title: string = ''

  private _viewType: ViewType

  private _weight: number = 1

  private _bound: Bound = { x: 0, y: 0, width: 0, height: 0 }

  private _yAxis: Axis

  public get yAxis(): Axis {
    return this._yAxis
  }

  public get panelType(): PanelType {
    return this._panelType
  }

  public get viewType(): ViewType {
    return this._viewType
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

  constructor(panelType: PanelType, viewType: ViewType, params: CommonObject = {}, styles: CommonObject = {}) {
    super()
    this._panelType = panelType
    this._viewType = viewType
    this._initWidgets()
    this.setAttrs({ params, styles, ...this.defaultConfig })
  }

  public initialYAxis() {
    const yExtent = this._getYExtent()
    this._yAxis = new Axis(yExtent, [0, this._bound.height])
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

  public contain(point: Point): boolean {
    return (
      point.x > this._bound.x &&
      point.y < this._bound.y &&
      point.x - this._bound.x < this._bound.width &&
      this._bound.y - point.y < this._bound.height
    )
  }

  public eachWidgets(callback: Function) {
    this.widgets.forEach(widget => {
      callback.call(this, widget)
    })
  }

  public getBound(): Bound {
    return this._bound
  }

  public setBound(bound: Bound) {
    this._bound = bound
    return this
  }

  public setViewBound() {
    const parent = this.getParent()
    const { margin, width } = parent.getConfig()
    const { visibleViewHeight, gapWidgets } = parent
    this._weight = 1 / (gapWidgets.length + 1)
    const index = parent.extPanels.indexOf(this)
    const eachViewHeight = (visibleViewHeight - GapWidgetHeight * gapWidgets.length) * this._weight
    this.setBound({
      x: margin.left,
      y: margin.top + eachViewHeight * (index + 2) + GapWidgetHeight * (index + 1),
      width: width - margin.left - margin.right,
      height: eachViewHeight,
    })
    this.updateWidgetsBound()
  }

  public updateViewBound(bound: { [k in keyof Bound]: number }) {
    this.setBound({ ...this._bound, ...bound })
  }

  public updateWidgetsBound() {
    this.eachWidgets(widget => widget.setViewBound())
  }

  public update() {
    if (this._isWaiting) {
      return
    }
    this._isWaiting = true
    requestAnimationFrame(() => {
      this.clearPanel()
      this.widgets.forEach(widget => {
        widget.render(DrawMode.YAxis)
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
    this._yAxis.domainRange
      .setMinValue(newCenter - halfInterval * scaleCoeff)
      .setMaxValue(newCenter + halfInterval * scaleCoeff)
  }

  public clearPanel() {
    const sceneCtx = this._parent.getContext()
    const axisCtx = this._parent.getAxisContext()
    const ctxs = [sceneCtx, axisCtx]
    const { x, y, width, height } = this._bound
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
      x: this._bound.width - margin - iconSize,
      y: this._bound.height - margin - iconSize,
      width: iconSize,
      height: iconSize,
    }
  }

  public getBarDatas(key: string): StandardBar[] {
    const barDatas: StandardBar[] = []
    const visibleData = this.getVisibleSeriesData()
    const parent = this.getParent()
    const { barWeight = 0.3 } = parent.getAttr('candlestick')
    const unitWidth = this.xAxis.unitWidth * barWeight
    const zeroCoord = this._yAxis.getCoordOfValue(0)
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

  private _getYExtent(): number[] {
    const visibleData = this.getVisibleSeriesData()
    let values: number[] = []
    const { MACD } = Indicator
    const params = this.getAttr('params')
    switch (this._viewType) {
      case ViewType.CANDLE:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          acc.push(...[cur.high, cur.low])
          return acc
        }, [])
        break
      case ViewType.MACD:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          const indicators = [cur[MACD.key], cur[MACD.oscillatorKey], cur[MACD.signalKey]].filter(isNumber)
          // const indicators = [cur[MACD.oscillatorKey]].filter(isNumber)
          acc.push(...indicators)
          return acc
        }, [])
        this._title = `MACD (${params.longPeriod}, ${params.shortPeriod}, ${params.signalPeriod})`
        break
      default:
        break
    }
    return [Math.min(...values), Math.max(...values)]
  }
}
