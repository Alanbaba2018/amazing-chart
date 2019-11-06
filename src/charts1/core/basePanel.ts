import EventHandle from './eventHandle'
import IWidget from './widgets/iWidget'
import Candlestick from './candlestick'
import { Bound, PanelType, CandlestickItem, ViewType, GapWidgetHeight } from '../typeof/type'
import Canvas from './canvas'
import Axis from '../model/axis'
import CandlestickWidget from './widgets/candlestick-widget'
import PriceAxisWidget from './widgets/price-axis-widget'
import ExtChartWidget from './widgets/ext/ext-chart-widget'

export default class BasePanel extends EventHandle {
  public widgets: IWidget[] = []

  private _isWaiting: boolean = false

  private _parent: Candlestick

  private _panelType: PanelType

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

  public get weight(): number {
    return this._weight
  }

  constructor(panelType: PanelType, viewType: ViewType) {
    super()
    this._panelType = panelType
    this._viewType = viewType
    this._initWidgets()
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

  public setPanelBound() {
    const parent = this.getParent()
    const { margin, width } = parent.getConfig()
    const { visibleViewHeight, gapWidgets } = parent
    this._weight = 1 / (gapWidgets.length + 1)
    const index = parent.extPanels.indexOf(this)
    const height = visibleViewHeight * this._weight
    this.setBound({
      x: margin.left,
      y: margin.top + height * (index + 1) + GapWidgetHeight * index,
      width: width - margin.left - margin.right,
      height,
    })
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
        widget.render()
      })
      this._isWaiting = false
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
    const ctx = this._parent.getContext()
    const axisCtx = this._parent.getAxisContext()
    const frameCtx = this._parent.getFrameContext()
    Canvas.clearRect(ctx, this._bound)
    Canvas.clearRect(axisCtx, this._bound)
    Canvas.clearRect(frameCtx, this._bound)
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
    switch (this._viewType) {
      case ViewType.CANDLE:
        values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
          acc.push(...[cur.high, cur.low])
          return acc
        }, [])
        break
      default:
        break
    }
    return [Math.min(...values), Math.max(...values)]
  }
}
