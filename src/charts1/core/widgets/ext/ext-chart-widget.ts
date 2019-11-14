import BaseChartWidget from '../base-chart-widget'
import ExtChartRenderer from '../../renderers/ext/ext-chart-renderer'
import { setCanvasContextStyle } from '../../../util/helper'
import { ColorMap, TextBaseLine, ViewType, DrawMode } from '../../../typeof/type'
import IPanel from '../IPanel'
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
    const parent = this.getParent() as IPanel
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
    this._drawSpecialChart(parent.viewName, sceneCtx)
    this.restoreCtxs(ctxs)
  }

  private _drawCloseIcon(frameCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as IPanel
    const closeIconBound = parent.getCloseIconBound()
    this.renderer.drawCloseIcon(frameCtx, closeIconBound)
  }

  private _drawSpecialChart(viewType: ViewType, sceneCtx: CanvasRenderingContext2D) {
    const actions = {
      [ViewType.MACD]: this.drawMacd,
      [ViewType.ATR]: this.drawATR,
      [ViewType.VOL]: this.drawVOL,
      [ViewType.MOMENTUM]: this.drawMOMENTUM,
    }
    if (actions[viewType]) {
      actions[viewType].call(this, sceneCtx)
    }
  }

  public drawMacd(sceneCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as IPanel
    const { MACD } = Indicator
    const oscBarDatas = parent.getCustomBarDatas(MACD.oscillatorKey)
    this.renderer.drawCandleBar(sceneCtx, oscBarDatas)
    setCanvasContextStyle(sceneCtx, { strokeStyle: ColorMap.LightGray })
    const macdLineDatas = parent.getLineDatas(MACD.key)
    this.renderer.drawLineChart(sceneCtx, macdLineDatas)
    const signalLineDatas = parent.getLineDatas(MACD.signalKey)
    setCanvasContextStyle(sceneCtx, { strokeStyle: ColorMap.CandleGreen })
    this.renderer.drawLineChart(sceneCtx, signalLineDatas)
  }

  public drawATR(sceneCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as IPanel
    const { ATR } = Indicator
    const { periods = [] } = parent.getAttr('params')
    setCanvasContextStyle(sceneCtx, { strokeStyle: ColorMap.LightGray })
    periods.forEach(period => {
      const lineDatas = parent.getLineDatas(`${ATR.key}${period}`)
      this.renderer.drawLineChart(sceneCtx, lineDatas)
    })
  }

  public drawVOL(sceneCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as IPanel
    const { up: upDatas, down: downDatas } = parent.getStandardBarDatas('volume')
    setCanvasContextStyle(sceneCtx, { fillStyle: ColorMap.CandleRed })
    this.renderer.drawBars(sceneCtx, downDatas)
    setCanvasContextStyle(sceneCtx, { fillStyle: ColorMap.CandleGreen })
    this.renderer.drawBars(sceneCtx, upDatas)
  }

  public drawMOMENTUM(sceneCtx: CanvasRenderingContext2D) {
    const parent = this.getParent() as IPanel
    const { MOMENTUM } = Indicator
    const { periods = [] } = parent.getAttr('params')
    const styles = parent.getAttr('styles')
    const lines = periods.map(period => parent.getLineDatas(`${MOMENTUM.key}${period}`))
    this.renderer.drawMultiLines(sceneCtx, lines, styles.colors)
  }
}
