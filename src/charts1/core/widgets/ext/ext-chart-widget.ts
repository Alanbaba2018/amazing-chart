import BaseChartWidget from '../base-chart-widget'
import ExtChartRenderer from '../../renderers/ext/ext-chart-renderer'
import { setCanvasContextStyle } from '../../../util/helper'
import { ColorMap, TextBaseLine, DrawMode } from '../../../typeof/type'
import IPanel from '../IPanel'
import Indicator from '../../indicator'

export default class ExtChartWidget extends BaseChartWidget {
  public renderer: ExtChartRenderer = new ExtChartRenderer()

  public weight: number = 0.3

  constructor() {
    super()
    this.setAttr('showClose', true)
  }

  public render(drawMode: DrawMode) {
    const root = this.getRoot()
    const parent = this.getParent() as IPanel
    const title = parent.getAttr('title')
    const frameCtx = root.getFrameContext()
    const hitCtx = root.getHitContext()
    const sceneCtx = root.getContext()
    const ctxs: CanvasRenderingContext2D[] = [frameCtx, hitCtx, sceneCtx]
    const config = root.getAttr('candlestick')
    this.initialCtxs(ctxs)
    this.createClipBound(sceneCtx)
    setCanvasContextStyle(sceneCtx, config.grid)
    const { xData, yData } = this.getXYTicksData()
    this.renderer.drawGrid(sceneCtx, this.bound, xData, yData)
    if (drawMode === DrawMode.All) {
      // draw title
      setCanvasContextStyle(frameCtx, {
        fillStyle: ColorMap.LightGray,
        textBaseline: TextBaseLine.Middle,
        strokeStyle: ColorMap.LightGray,
      })
      this.renderer.drawTitle(frameCtx, title, { x: 10, y: -this.bound.height + 10 })
      const isShowClose = this.getAttr('showClose')
      isShowClose && this._drawCloseIcon(frameCtx)
    }
    this._renderIndicatorCharts(sceneCtx)
    this.restoreCtxs(ctxs)
  }

  private _drawCloseIcon(frameCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as IPanel
    const closeIconBound = parent.getCloseIconBound()
    this.renderer.drawCloseIcon(frameCtx, closeIconBound)
  }

  private _renderIndicatorCharts(ctx: CanvasRenderingContext2D) {
    const root = this.getRoot()
    const { indicatorViews } = root
    const seriesData = root.getSeriesData()
    indicatorViews.forEach(view => {
      if (!view.isHistBase) {
        const curIndicator = Indicator[view.type]
        if (curIndicator) {
          const results = curIndicator.getResult(seriesData, view.params)
          results.forEach(this.plotChart.bind(this, ctx))
        }
      }
    })
  }
}
