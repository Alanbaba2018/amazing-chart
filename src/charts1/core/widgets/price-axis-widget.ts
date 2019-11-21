import IWidget from './iWidget'
import PriceAxisRenderer from '../renderers/price-axis-renderer'
import { TickData, CommonObject, DrawMode } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle, isZero } from '../../util/helper'
import IPanel from './IPanel'

export default class PriceAxisWidget extends IWidget {
  public renderer = new PriceAxisRenderer()

  constructor() {
    super()
    this.on('mousemove', this.onmousemove.bind(this))
    this.on('mousewheel', this.onmousewheel.bind(this))
  }

  public render(drawMode: DrawMode) {
    const root = this.getRoot()
    const { yAxis: config } = root.getConfig()
    const axisCtx: CanvasRenderingContext2D = root.getAxisContext()
    const sceneCtx: CanvasRenderingContext2D = root.getContext()
    const frameCtx: CanvasRenderingContext2D = root.getFrameContext()
    const ctxs: CanvasRenderingContext2D[] = [axisCtx, sceneCtx, frameCtx]
    this.initialCtxs(ctxs)
    this.createClipBound(axisCtx)
    const { tickWidth, textMargin, tickColor } = config
    setCanvasContextStyle(axisCtx, { ...config, strokeStyle: tickColor })
    this.renderer.drawTicks(axisCtx, this.getTicksData(), textMargin, tickWidth)
    if (drawMode === DrawMode.All) {
      setCanvasContextStyle(frameCtx, config)
      // draw border
      this.renderer.draw(frameCtx, this.bound)
    }
    this.restoreCtxs(ctxs)
  }

  public setViewBound() {
    const root = this.getRoot()
    const parent = this.getParent()
    const bound = (parent as IPanel).getBound()
    const margin = root.getAttr('margin')
    this.setBound({
      x: bound.x + bound.width - margin.right,
      y: bound.y,
      width: margin.right,
      height: bound.height,
    })
  }

  public getTicksData(): TickData[] {
    const parent = this.getParent() as IPanel
    const axis = parent.yAxis
    const axisData = axis.getAxisData()
    return axisData
  }

  private onmousemove(evt: CommonObject) {
    const parent = this.getParent() as IPanel
    const viewPoint = this.transformPointToView(evt.point)
    const isMouseover = this.getAttr('isMouseover')
    const isHoverClose = parent.isHoverCloseIcon(viewPoint)
    if (!isMouseover || !isHoverClose) {
      setElementStyle(this.getRoot().getHitCanvas(), { cursor: 'ns-resize' })
    }
  }

  private onmousewheel(data: CommonObject) {
    const { deltaY } = data.originEvent
    const parent = this.getParent() as IPanel
    const root = this.getRoot()
    const { yAxis } = parent
    const oldScaleCoeff = yAxis.getCurrentScaleCoeff()
    const { scaleRatio } = root.getAttr('yAxis')
    // deltaY > 0 ? 1.05 : 0.95;
    // zoomIn and zoomOut should be reciprocal relationship
    const coeff = deltaY > 0 ? 1 + scaleRatio : 1 / (1 + scaleRatio)
    yAxis.scaleAroundCenter(coeff)
    const newScaleCoeff = yAxis.getCurrentScaleCoeff()
    if (!isZero(oldScaleCoeff - newScaleCoeff)) {
      parent.update()
    }
  }
}
