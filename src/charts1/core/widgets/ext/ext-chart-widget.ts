import BaseChartWidget from '../base-chart-widget'
import ExtChartRenderer from '../../renderers/ext/ext-chart-renderer'
import { setCanvasContextStyle } from '../../../util/helper'
import { DrawMode } from '../../../typeof/type'
import IPanel from '../IPanel'

export default class ExtChartWidget extends BaseChartWidget {
  public renderer: ExtChartRenderer = new ExtChartRenderer()

  public weight: number = 0.3

  public render(drawMode: DrawMode) {
    const root = this.getRoot()
    const parent = this.getParent() as IPanel
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
      const isShowClose = parent.getAttr('isShowClose')
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
    const parent = this.getParent() as IPanel
    const results = parent.chartResult
    results.forEach(this.plotChart.bind(this, ctx))
  }
}
