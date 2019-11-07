import IWidget from './iWidget'
import PriceAxisRenderer from '../renderers/price-axis-renderer'
import { TickData, CommonObject, Point, DrawMode } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle, isZero, isBoundContain } from '../../util/helper'
// import Canvas from '../canvas'
import BasePanel from '../basePanel'

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
    const bound = (parent as BasePanel).getBound()
    const yAxis = root.getAttr('yAxis')
    this.setBound({
      x: bound.x + bound.width - yAxis.width,
      y: bound.y,
      width: yAxis.width,
      height: bound.height,
    })
  }

  public getTicksData(): TickData[] {
    const parent = this.getParent() as BasePanel
    const axis = parent.yAxis
    const axisData = axis.getAxisData()
    return axisData
  }

  private isHoverCloseIcon(point: Point): boolean {
    const parent = this.getParent() as BasePanel
    if (!this.bound.width) {
      return false
    }
    const closeBound = parent.getCloseIconBound()
    return isBoundContain(closeBound, point)
  }

  private onmousemove(evt: any) {
    const root = this.getRoot()
    const viewPoint = this.transformPointToView(evt.point)
    if (this.isHoverCloseIcon(viewPoint)) {
      setElementStyle(root.getHitCanvas(), { cursor: 'pointer' })
      return
    }
    setElementStyle(this.getRoot().getHitCanvas(), { cursor: 'ns-resize' })
  }

  private onmousewheel(data: CommonObject) {
    const { deltaY } = data.originEvent
    const parent = this.getParent() as BasePanel
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
