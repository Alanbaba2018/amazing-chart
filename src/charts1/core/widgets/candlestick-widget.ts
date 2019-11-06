import BaseChartWidget from './base-chart-widget'
import CandlestickRenderer from '../renderers/candlestick-renderer'
import { Point, ExtendView, ViewType, TickData, CandlestickItem, CandlestickBar, Trend } from '../../typeof/type'
import { setCanvasContextStyle } from '../../util/helper'
import * as Indicator from '../indicator'
import BasePanel from '../basePanel'

export default class CandlestickWidget extends BaseChartWidget {
  public config = { zIndex: 1 }

  public renderer = new CandlestickRenderer()

  public get parent(): BasePanel {
    return this.getParent() as BasePanel
  }

  public render() {
    const parent = this.getRoot()
    const config = parent.getAttr('candlestick')
    const ctx: CanvasRenderingContext2D = parent.getContext()
    ctx.save()
    this.setCanvasTransform(ctx)
    setCanvasContextStyle(ctx, config.grid)
    const { xData, yData } = this.getXYTicksData()
    this.renderer.drawGrid(ctx, this.bound, xData, yData)
    this.renderer.draw(ctx, this.getVisibleBars(), config)
    this.renderExtendViews(ctx)
    ctx.restore()
  }

  private renderExtendViews(ctx: CanvasRenderingContext2D) {
    const extendViews: ExtendView[] = this.getParent().getAttr('extends') || []
    extendViews.forEach(view => {
      if (view.type === ViewType.EMA) {
        const { params, styles } = view
        const lines = this.getEMALines(params.periods)
        this.renderer.drawMultiLines(ctx, lines, styles.colors)
      } else if (view.type === ViewType.BOLL) {
        const { styles } = view
        const lines = this.getBollLines()
        this.renderer.drawMultiLines(ctx, lines, styles.colors)
      }
    })
  }

  private getBollLines(): Point[][] {
    const root = this.getRoot()
    const parent = this.getParent() as BasePanel
    const xAxis = root.getXAxis()
    const { yAxis } = parent
    const visibleBars = this.getVisibleBars()
    const lineMap: { [k: string]: Point[] } = {
      up: [],
      md: [],
      dn: [],
    }
    for (let i = 0; i < visibleBars.length; i++) {
      const item = visibleBars[i]
      const x = xAxis.getCoordOfValue(item.time)
      const upY = yAxis.getCoordOfValue(item[Indicator.BOLL.upKey])
      const mdY = yAxis.getCoordOfValue(item[Indicator.BOLL.mdKey])
      const dnY = yAxis.getCoordOfValue(item[Indicator.BOLL.dnKey])
      lineMap.up.push({ x, y: -upY })
      lineMap.md.push({ x, y: -mdY })
      lineMap.dn.push({ x, y: -dnY })
    }
    return [lineMap.up, lineMap.md, lineMap.dn]
  }

  private getEMALines(periods: number[]): Point[][] {
    const root = this.getRoot()
    const parent = this.getParent() as BasePanel
    const xAxis = root.getXAxis()
    const { yAxis } = parent
    const visibleBars = this.getVisibleBars()
    const lines: Point[][] = []
    for (let i = 0; i < visibleBars.length; i++) {
      const item = visibleBars[i]
      const x = xAxis.getCoordOfValue(item.time)
      for (let j = 0; j < periods.length; j++) {
        const y = yAxis.getCoordOfValue(item[`EMA${periods[j]}`])
        if (i === 0) {
          lines[j] = []
        }
        lines[j].push({ x, y: -y })
      }
    }
    return lines
  }

  private getXYTicksData() {
    const root = this.getRoot()
    const parent = this.getParent() as BasePanel
    const xAxisData = root.getXAxis().getAxisData()
    const yAxisData = parent.yAxis.getAxisData()
    return {
      xData: xAxisData.map((tickData: TickData) => tickData.p),
      yData: yAxisData.map((tickData: TickData) => tickData.p),
    }
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

  private getVisibleBars(): CandlestickBar[] {
    const root = this.getRoot()
    const visibleData = this.parent.getVisibleSeriesData()
    return visibleData.map((item: CandlestickItem) => {
      const { x, lowY, highY, openY, closeY } = this.getBarPosition(item)
      return {
        ...item,
        x,
        y: Math.min(openY, closeY),
        width: this.xAxis.unitWidth * root.getAttr('candlestick').barWeight || 0.3,
        height: Math.abs(closeY - openY),
        openY,
        closeY,
        highY,
        lowY,
        type: item.close - item.open > 0 ? Trend.Up : Trend.Down,
      }
    })
  }
}
