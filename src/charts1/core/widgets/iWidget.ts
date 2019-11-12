import IBound from './iBound'
import IPanel from './IPanel'
import Candlestick from '../candlestick'
import IRenderer from '../renderers/iRenderer'
import { Bound, DrawMode } from '../../typeof/type'
import { getDevicePixelRatio } from '../../util/helper'
import Axis from '../../model/axis'

export default abstract class IWidget extends IBound {
  private _parent: Candlestick | IPanel

  public get xAxis(): Axis {
    return this.getRoot().getXAxis()
  }

  public remove() {
    const parent = this.getParent()
    if (parent instanceof IPanel) {
      parent.removeWidget(this)
    } else {
      parent.removePanel(this)
    }
  }

  public setParent(parent: Candlestick | IPanel) {
    if (this._parent) {
      throw new Error('Current Node had parent, Pls do not set parent repeatly!')
    }
    this._parent = parent
  }

  public getParent(): Candlestick | IPanel {
    return this._parent
  }

  public getRoot(): Candlestick {
    if (this._parent instanceof IPanel) {
      return this._parent.getParent()
    }
    return this._parent
  }

  public setCanvasTransform(ctx: CanvasRenderingContext2D) {
    ctx.scale(getDevicePixelRatio(), getDevicePixelRatio())
    ctx.translate(this.bound.x, this.bound.y)
  }

  public initialCtxs(ctxs: CanvasRenderingContext2D[]) {
    ctxs.forEach(ctx => {
      ctx.save()
      this.setCanvasTransform(ctx)
    })
  }

  public restoreCtxs(ctxs: CanvasRenderingContext2D[]) {
    ctxs.forEach(ctx => ctx.restore())
  }

  public createClipBound(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.rect(0, -this.bound.height, this.bound.width, this.bound.height)
    ctx.clip()
  }

  public abstract renderer: IRenderer

  public abstract setViewBound(bound?: Bound): void

  public abstract render(drawMode: DrawMode): void
}
