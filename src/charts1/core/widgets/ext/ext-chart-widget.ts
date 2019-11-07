import BaseChartWidget from '../base-chart-widget'
import ExtChartRenderer from '../../renderers/ext/ext-chart-renderer'
import { setCanvasContextStyle } from '../../../util/helper'
import { ColorMap, TextBaseLine, ViewType, DrawMode } from '../../../typeof/type'
import BasePanel from '../../basePanel'
import * as Indicator from '../../indicator'

export default class ExtChartWidget extends BaseChartWidget {
  public renderer: ExtChartRenderer = new ExtChartRenderer()

  public weight: number = 0.3

  constructor() {
    super()
    this.setAttr('showClose', true)
  }

  public render(drawMode: DrawMode) {
    const root = this.getRoot()
    const parent = this.getParent() as BasePanel
    const { title } = parent
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
    if (!drawMode || drawMode === DrawMode.All) {
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
    this._drawSpecialChart(parent.viewType, sceneCtx)
    this.restoreCtxs(ctxs)
  }

  private _drawCloseIcon(frameCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as BasePanel
    const closeIconBound = parent.getCloseIconBound()
    this.renderer.drawCloseIcon(frameCtx, closeIconBound)
  }

  private _drawSpecialChart(viewType: ViewType, sceneCtx: CanvasRenderingContext2D) {
    const actions = {
      [ViewType.MACD]: this.drawMacd,
    }
    if (actions[viewType]) {
      actions[viewType].call(this, sceneCtx)
    }
  }

  public drawMacd(sceneCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as BasePanel
    const { MACD } = Indicator
    const oscBarDatas = parent.getBarDatas(MACD.oscillatorKey)
    this.renderer.drawCandleBar(sceneCtx, oscBarDatas)
    setCanvasContextStyle(sceneCtx, { strokeStyle: ColorMap.LightGray })
    const macdLineDatas = parent.getLineDatas(MACD.key)
    this.renderer.drawLineChart(sceneCtx, macdLineDatas)
    const signalLineDatas = parent.getLineDatas(MACD.signalKey)
    setCanvasContextStyle(sceneCtx, { strokeStyle: ColorMap.CandleGreen })
    this.renderer.drawLineChart(sceneCtx, signalLineDatas)
  }
}
