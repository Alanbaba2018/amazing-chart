/* eslint-disable max-lines*/
import IBound from './iBound'
import IWidget from './iWidget'
import Candlestick from '../candlestick'
import {
  Bound,
  PanelType,
  CandlestickItem,
  IndicatorType,
  CommonObject,
  StandardBar,
  DrawMode,
  Point,
  CommonKeys,
  ColorMap,
} from '../../typeof/type'
import { GapWidgetHeight } from '../../typeof/constant'
import Canvas from '../canvas'
import Axis from '../../model/axis'
import FixAxis from '../../model/fix-axis'
import CandlestickWidget from './candlestick-widget'
import PriceAxisWidget from './price-axis-widget'
import ExtChartWidget from './ext/ext-chart-widget'
import Indicator, { PlotItem, IndicatorResult } from '../indicator'
import {
  setElementStyle,
  isBoundContain,
  formatNumber,
  measureTextWidth,
  createElement,
  formatTime,
} from '../../util/helper'

interface IPanelOptions {
  indicatorType: IndicatorType
  params?: CommonObject
  [k: string]: any
}

interface Label {
  label: string
  key?: string
  styles?: Object
}

export default class IPanel extends IBound {
  public widgets: IWidget[] = []

  private defaultConfig = { iconSize: 10, margin: 5, isShowClose: false, titleInfo: {} }

  private _isWaiting: boolean = false

  private _parent: Candlestick

  // Base or Indicator chart
  private _panelType: PanelType

  private _weight: number = 1

  private _yAxis: Axis

  private _yAxisWidth: number = 60

  private _wrapperContainer: HTMLElement

  private _titleContainer: HTMLElement

  private _result: Map<IndicatorType, IndicatorResult[]> = new Map()

  private _isFirstWatch: boolean = true

  public get yAxis(): Axis {
    return this._yAxis
  }

  public get panelType(): PanelType {
    return this._panelType
  }

  public get weight(): number {
    return this._weight
  }

  public get xAxis(): Axis {
    return this.getParent().getXAxis()
  }

  public get chartResult(): IndicatorResult[] {
    const indicatorType = this.getAttr('indicatorType')
    return this._result.get(indicatorType) || []
  }

  public get results(): IndicatorResult[][] {
    return Array.from(this._result.values())
  }

  public get yAxisWidth(): number {
    return this._yAxisWidth
  }

  public get titleContainer(): HTMLElement {
    return this._titleContainer
  }

  constructor(panelType: PanelType, options: IPanelOptions) {
    super()
    this._panelType = panelType
    this.setAttrs({ ...options, ...this.defaultConfig })
    this._initWidgets()
  }

  public setYAxis() {
    const yExtent = this._getYExtent()
    const isScaleCenter = this.getAttr('isScaleCenter')
    const padding: number = 5
    const middleY = formatNumber((yExtent[0] + yExtent[1]) / 2)
    this._yAxisWidth = measureTextWidth(`${middleY}`)
    if (isScaleCenter) {
      this._yAxis = new Axis(yExtent, [padding, this.bound.height - padding])
    } else {
      this._yAxis = new FixAxis([0, yExtent[1]], [0, (this.bound.height - padding) * 0.8])
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
    this._afterSetParent()
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
    const allWidght = 7 + 3 * (iPanels.length - 1)
    this._weight = this.panelType === PanelType.BASE ? 7 / allWidght : 3 / allWidght
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
      width: width - margin.left,
      height: viewHeight,
    })
    this.setWidgetsBound()
    this.updateTitleContainer()
  }

  public updateViewBound(allWeight: number = 1) {
    this._weight /= allWeight
    this.setBound(this.getUpdatedBound())
    this.setWidgetsBound()
    this.setYAxis()
    this.updateTitleContainer()
  }

  public updateViewBoundHeight(dh: number, dy: number) {
    const parent = this.getParent()
    const { visibleViewHeight, gapWidgetsLength } = parent
    const clearHeight = visibleViewHeight - GapWidgetHeight * gapWidgetsLength
    const updatedHeight = this.bound.height + dh
    this._weight = updatedHeight / clearHeight
    this.setBound({ ...this.bound, y: this.bound.y + dy, height: updatedHeight })
    this.setWidgetsBound()
    this.setYAxis()
    this.updateTitleContainer()
  }

  public setWidgetsBound() {
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

  public removeIndicator(type: IndicatorType) {
    this._result.delete(type)
  }

  public destroy() {
    const { titleContainer: pTitleContainer } = this.getParent()
    pTitleContainer.removeChild(this._wrapperContainer)
  }

  public updateYExtend() {
    const yExtent = this._getYExtent()
    const newCenter = (yExtent[0] + yExtent[1]) / 2
    const halfInterval = (yExtent[1] - yExtent[0]) / 2
    const scaleCoeff = this._yAxis.getScaleCoeff()
    const isScaleCenter = this.getAttr('isScaleCenter')
    if (isScaleCenter) {
      this._yAxis.domainRange
        .setMinValue(newCenter - halfInterval * scaleCoeff)
        .setMaxValue(newCenter + halfInterval * scaleCoeff)
    } else {
      this._yAxis.domainRange.setMinValue(0).setMaxValue(halfInterval * 2 * scaleCoeff)
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

  public getBarDatas(data: PlotItem[]): StandardBar[] {
    const parent = this.getParent()
    const { barWeight = 0.3 } = parent.getAttr('candlestick')
    const unitWidth = this.xAxis.unitWidth * barWeight
    const zeroCoord = this.yAxis.getCoordOfValue(0)
    return data.map(item => {
      const { time, value } = item
      const x = this.xAxis.getCoordOfValue(time)
      const y = this.yAxis.getCoordOfValue(value)
      return {
        x: x - unitWidth,
        y: value > 0 ? -y : -zeroCoord,
        width: unitWidth * 2,
        height: Math.abs(y - zeroCoord),
      }
    })
  }

  public getLineDatas(data: PlotItem[]): Point[] {
    return data.map(item => {
      const x = this.xAxis.getCoordOfValue(item.time)
      const y = this.yAxis.getCoordOfValue(item.value)
      return { x, y: -y }
    })
  }

  public isHoverCloseIcon(viewPoint: Point): boolean {
    if (!this.bound.width) {
      return false
    }
    const closeBound = this.getCloseIconBound()
    return isBoundContain(closeBound, viewPoint)
  }

  public updateChartData() {
    const _indicatorType = this.getAttr('indicatorType')
    const { indicatorViews } = this.getParent()
    const seriesData = this.getSeriesData()
    if (_indicatorType !== IndicatorType.CANDLE) {
      const result = Indicator[_indicatorType].getResult(seriesData, this.getAttr('params'))
      this._result.set(_indicatorType, result)
    } else {
      indicatorViews.forEach(({ indicatorType, isHistBase, params }) => {
        if (!isHistBase) return
        const curIndicator = Indicator[indicatorType]
        if (curIndicator) {
          const result = curIndicator.getResult(seriesData, params)
          this._result.set(indicatorType, result)
        }
      })
    }
  }

  public updateTitleContainer() {
    const parent = this.getParent()
    const margin = parent.getAttr('margin')
    const { x, y, height, width } = this.getBound()
    const styles = {
      position: 'absolute',
      top: `${y - height}px`,
      left: `${x}px`,
      width: `${width - margin.right}px`,
      padding: '3px 8px',
      fontSize: '12px',
      color: ColorMap.White,
      boxSizing: 'border-box',
    }
    if (this._wrapperContainer) {
      setElementStyle(this._wrapperContainer, styles)
    } else {
      const { titleContainer: pTitleContainer } = this.getParent()
      this._wrapperContainer = createElement('div', styles)
      this._titleContainer = createElement('div', { width: '100%', display: 'flex', flex: 1, lineHeight: 1.5 })
      this._wrapperContainer.appendChild(this._titleContainer)
      pTitleContainer.appendChild(this._wrapperContainer)
    }
    const currentItem = parent.getAttr('currentItem')
    currentItem && this.updateTitleLabel(currentItem)
  }

  public updateTitleLabel(currentItem: CandlestickItem) {
    const titleInfo = this.getAttr('titleInfo')
    const indicatorType = this.getAttr('indicatorType')
    const labels: Label[] = this._getTitleLabels(currentItem, indicatorType)
    if (indicatorType === IndicatorType.CANDLE) {
      this.updateHistBaseChartsTitle(currentItem)
    }
    labels.forEach(item => {
      const { label, key, styles = {} } = item
      if (this._isFirstWatch) {
        const ele = createElement('span', { paddingRight: '5px' })
        this._titleContainer.appendChild(ele)
        if (key !== undefined) {
          titleInfo[key] = ''
          this.watchProperty(titleInfo, key, ele)
        } else {
          ele.textContent = label
        }
      }
      key !== undefined && this.setWatchProperty(titleInfo, key, label, styles)
    })
    if (labels.length > 0 && this._isFirstWatch) {
      this._isFirstWatch = false
    }
  }

  private updateHistBaseChartsTitle(currentItem: CandlestickItem) {
    const { indicatorViews } = this.getParent()
    const titleInfo = this.getAttr('titleInfo')
    indicatorViews.forEach(view => {
      const { indicatorType, subElement } = view
      const labels = this._getTitleLabels(currentItem, indicatorType, view.params)
      labels.forEach(item => {
        const { label, key, styles = {} } = item
        if (!subElement.parentNode) {
          const ele = createElement('span', { paddingRight: '5px' })
          subElement.appendChild(ele)
          if (key !== undefined) {
            titleInfo[key] = ''
            this.watchProperty(titleInfo, key, ele)
          } else {
            ele.textContent = label
          }
        }
        key !== undefined && this.setWatchProperty(titleInfo, key, label, styles)
      })
      !subElement.parentNode && this._wrapperContainer.appendChild(subElement)
    })
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
    const viewWidth = width - margin.left
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
    const isShowClose = this.getAttr('isShowClose')
    isShowClose && this.on('click', this._onclick.bind(this))
    const parent = this.getParent()
    parent.on(`currentItem${CommonKeys.Change}`, ({ newVal }) => {
      this.updateTitleLabel(newVal)
    })
  }

  private _onclick(evt: CommonObject) {
    const parent = this.getParent()
    const viewPoint = this.transformPointToView(evt.point)
    if (this.isHoverCloseIcon(viewPoint)) {
      parent.closeIndicatorPanelByName(this.getAttr('indicatorType'))
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
    let values: number[] = []
    const indicatorType = this.getAttr('indicatorType')
    if (this._result.size === 0) {
      this.updateChartData()
    }
    if (indicatorType === IndicatorType.CANDLE) {
      const visibleData = this.getVisibleSeriesData()
      values = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
        acc.push(...[cur.high, cur.low])
        return acc
      }, [])
    } else if (Indicator[indicatorType]) {
      const visibleTimeRange = this.xAxis.domainRange
      const result = this._result.get(indicatorType) || []
      values = result.reduce((acc: number[], { data = [] }) => {
        const vals = data.reduce((_acc: number[], item: PlotItem) => {
          visibleTimeRange.contain(item.time) && _acc.push(item.value)
          return _acc
        }, [])
        acc.push(...vals)
        return acc
      }, [])
    }
    return [Math.min(...values), Math.max(...values)]
  }

  private _getTitleLabels(currentItem: CandlestickItem, indicatorType: IndicatorType, params = {}): Label[] {
    let labels: Label[] = []
    if (indicatorType === IndicatorType.CANDLE) {
      const { time, open, high, low, close } = currentItem
      const styles = close > open ? { color: ColorMap.CandleGreen } : { color: ColorMap.CandleRed }
      labels.push(
        { label: formatTime(time), key: 't' },
        { label: 'O:' },
        { label: `${open}`, key: 'o', styles },
        { label: 'H:' },
        { label: `${high}`, key: 'h', styles },
        { label: 'L:' },
        { label: `${low}`, key: 'l', styles },
        { label: 'C:' },
        { label: `${close}`, key: 'c', styles },
      )
    } else {
      const result = this._result.get(indicatorType) || []
      labels = Indicator[indicatorType].getLabel(currentItem.time, result, params)
    }
    return labels
  }

  private _afterSetParent() {
    this._initEvents()
  }
}
