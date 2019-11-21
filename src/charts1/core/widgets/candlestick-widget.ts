import BaseChartWidget from './base-chart-widget'
import CandlestickRenderer from '../renderers/candlestick-renderer'
import {
  Point,
  CandlestickItem,
  CandlestickBar,
  Trend,
  ColorMap,
  Direction,
  TextAlign,
  TextBaseLine,
} from '../../typeof/type'
import { setCanvasContextStyle } from '../../util/helper'
import Indicator from '../indicator'
import IPanel from './IPanel'
import GraphHelper from '../graphHelper'
import Canvas from '../canvas'

export default class CandlestickWidget extends BaseChartWidget {
  public renderer = new CandlestickRenderer()

  public get parent(): IPanel {
    return this.getParent() as IPanel
  }

  public render() {
    const root = this.getRoot()
    const config = root.getAttr('candlestick')
    const sceneCtx: CanvasRenderingContext2D = root.getContext()
    const ctxs = [sceneCtx]
    this.initialCtxs(ctxs)
    this.createClipBound(sceneCtx)
    const { xData, yData } = this.getXYTicksData()
    setCanvasContextStyle(sceneCtx, config.grid)
    this.renderer.drawGrid(sceneCtx, this.bound, xData, yData)
    this.renderIndicatorChats(sceneCtx)
    this.renderer.draw(sceneCtx, this.getVisibleBars(), config)
    this.drawMaxAndMinArrows(sceneCtx)
    this.restoreCtxs(ctxs)
  }

  public plotDetailLabel(label: string) {
    const root = this.getRoot()
    const _hitCtx = root.getHitContext()
    this.initialCtxs([_hitCtx])
    setCanvasContextStyle(_hitCtx, {
      fillStyle: ColorMap.White,
      textBaseline: TextBaseLine.Middle,
      strokeStyle: ColorMap.LightGray,
      font: '12px Arial',
    })
    this.renderer.drawTitle(_hitCtx, label, { x: 10, y: -this.bound.height + 10 })
    this.restoreCtxs([_hitCtx])
  }

  private drawMaxAndMinArrows(ctx: CanvasRenderingContext2D) {
    setCanvasContextStyle(ctx, { fillStyle: ColorMap.White, strokeStyle: ColorMap.White })
    const [max, min] = this.getMaxMinItems()
    if (max && min) {
      this.drawArrowText(ctx, max)
      this.drawArrowText(ctx, min)
    }
  }

  private drawArrowText(ctx: CanvasRenderingContext2D, item: { time: number; value: number }) {
    setCanvasContextStyle(ctx, { textAlign: TextAlign.Right, textBaseline: TextBaseLine.Middle })
    const pt = this.getPosition(item.time, item.value)
    const textWidth = Canvas.measureTextWidth(ctx, `${item.value}`)
    let arrowData = GraphHelper.createArrowData(pt)
    let lastPoint = arrowData[arrowData.length - 1]
    let textOffset: number = -3
    if (this.isOverlapLeft(lastPoint.x - textWidth)) {
      arrowData = GraphHelper.createArrowData(pt, Direction.Left)
      setCanvasContextStyle(ctx, { textAlign: TextAlign.Left })
      textOffset = 3
    }
    this.renderer.drawPaths(ctx, arrowData)
    lastPoint = arrowData[arrowData.length - 1]
    Canvas.drawText(ctx, `${item.value}`, lastPoint.x + textOffset, lastPoint.y)
  }

  private renderIndicatorChats(ctx: CanvasRenderingContext2D) {
    const root = this.getRoot()
    const { indicatorViews } = root
    const seriesData = root.getSeriesData()
    indicatorViews.forEach(view => {
      if (view.isHistBase) {
        const curIndicator = Indicator[view.type]
        if (curIndicator) {
          const results = curIndicator.getResult(seriesData, view.params)
          results.forEach(this.plotChart.bind(this, ctx))
        }
      }
    })
  }

  private getBarPosition(bar: CandlestickItem) {
    const { time, low, high, open, close } = bar
    const x = this.xAxis.getCoordOfValue(time)
    const lowY = this.parent.yAxis.getCoordOfValue(low)
    const highY = this.parent.yAxis.getCoordOfValue(high)
    const openY = this.parent.yAxis.getCoordOfValue(open)
    const closeY = this.parent.yAxis.getCoordOfValue(close)
    return { x, lowY, highY, openY, closeY }
  }

  private getPosition(time: number, price: number): Point {
    return {
      x: this.xAxis.getCoordOfValue(time),
      y: -this.parent.yAxis.getCoordOfValue(price),
    }
  }

  private getVisibleBars(): CandlestickBar[] {
    const root = this.getRoot()
    const visibleData = root.getVisibleSeriesData()
    const { barWeight = 0.3 } = root.getAttr('candlestick')
    return visibleData.map((item: CandlestickItem) => {
      const { x, lowY, highY, openY, closeY } = this.getBarPosition(item)
      return {
        ...item,
        x,
        y: Math.min(openY, closeY),
        width: this.xAxis.unitWidth * barWeight,
        height: Math.max(1, Math.abs(closeY - openY)),
        openY,
        closeY,
        highY,
        lowY,
        type: item.close - item.open > 0 ? Trend.Up : Trend.Down,
      }
    })
  }

  private getMaxMinItems(): Array<{ time: number; value: number }> {
    const root = this.getRoot()
    const timeRange = this.xAxis.domainRange
    const visibleData = root.getVisibleSeriesData().filter(item => timeRange.contain(item.time))
    if (visibleData.length === 0) return []
    const max = {
      time: visibleData[0].time,
      value: visibleData[0].high,
    }
    const min = {
      time: visibleData[0].time,
      value: visibleData[0].high,
    }
    for (let i = 1; i < visibleData.length; i++) {
      const current = visibleData[i]
      if (current.high > max.value) {
        max.time = current.time
        max.value = current.high
      }
      if (current.low < min.value) {
        min.time = current.time
        min.value = current.low
      }
    }
    return [max, min]
  }

  private isOverlapLeft(x: number): boolean {
    return x < this.xAxis.coordRange.getMinValue()
  }
}
