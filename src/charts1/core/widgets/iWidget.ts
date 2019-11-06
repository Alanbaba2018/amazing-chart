import EventHandle from '../eventHandle'
import BasePanel from '../basePanel'
import Candlestick from '../candlestick'
import IRenderer from '../renderers/iRenderer'
import { Bound, Point } from '../../typeof/type'
import { getDevicePixelRatio } from '../../util/helper'
import Axis from '../../model/axis'

export default abstract class IWidget extends EventHandle {
  public config = { zIndex: 0 }

  public bound: Bound = { x: 0, y: 0, width: 0, height: 0 }

  private _parent: Candlestick | BasePanel

  public get xAxis(): Axis {
    return this.getRoot().getXAxis()
  }

  public remove() {
    const parent = this.getParent()
    if (parent instanceof BasePanel) {
      parent.removeWidget(this)
    } else {
      parent.removePanel(this)
    }
  }

  public setParent(parent: Candlestick | BasePanel) {
    if (this._parent) {
      throw new Error('Current Node had parent, Pls do not set parent repeatly!')
    }
    this._parent = parent
  }

  public getParent(): Candlestick | BasePanel {
    return this._parent
  }

  public getRoot(): Candlestick {
    if (this._parent instanceof BasePanel) {
      return this._parent.getParent()
    }
    return this._parent
  }

  public getBound(): Bound {
    return this.bound
  }

  public setBound(bound: Bound) {
    this.bound = bound
    return this
  }

  public setCanvasTransform(ctx: CanvasRenderingContext2D) {
    ctx.scale(getDevicePixelRatio(), getDevicePixelRatio())
    ctx.translate(this.bound.x, this.bound.y)
  }

  public contain(point: Point): boolean {
    return (
      point.x > this.bound.x &&
      point.y < this.bound.y &&
      point.x - this.bound.x < this.bound.width &&
      this.bound.y - point.y < this.bound.height
    )
  }

  public updateViewBound(bound: { [k in keyof Bound]: number }) {
    this.setBound({ ...this.bound, ...bound })
  }

  public initialData() {}

  public abstract renderer: IRenderer

  public abstract setViewBound(bound?: Bound): void

  public abstract render(): void
}
