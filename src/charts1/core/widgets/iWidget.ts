import EventHandle from '../eventHandle'
import Candlestick from '../candlestick'
import IRenderer from '../renderers/iRenderer'
import { Bound, Point, DevicePixelRatio } from '../../typeof/type'


export default abstract class IWidget extends EventHandle {
  public config = { zIndex: 0 };

  public bound: Bound = { x: 0, y: 0, width: 0, height: 0 };

  private _parent!: Candlestick;

  public remove () {
    const parent = this.getParent()
    if (parent) {
      parent.removeWidget(this)
    }
  }

  public setParent (parent: Candlestick) {
    if (this._parent) {
      throw new Error('Current Node had parent, Pls don\'t set parent repeatly!')
    }
    this._parent = parent
  }

  public getParent (): Candlestick {
    return this._parent
  }

  public getContext (): CanvasRenderingContext2D {
    const parent = this.getParent()
    return parent.getContext()
  }

  public getBound (): Bound {
    return this.bound
  }

  public setBound (bound: Bound) {
    this.bound = bound
    return this
  }

  public setCanvasTransform (ctx: CanvasRenderingContext2D) {
    ctx.scale(DevicePixelRatio, DevicePixelRatio)
    ctx.translate(this.bound.x, this.bound.y)
  }

  public contain (point: Point): boolean {
    return point.x > this.bound.x && point.y < this.bound.y
      && point.x - this.bound.x < this.bound.width
      && this.bound.y - point.y < this.bound.height
  }

  public abstract renderer: IRenderer;

  public abstract setWidgetBound(): void;

  public abstract render(): void;
}
