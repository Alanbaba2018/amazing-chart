import EventHandle from '../eventHandle';
import IRenderer from '../renderers/iRenderer';
import BasePanel from '../basePanel';
import { Bound, CommonObject, Point } from '../../typeof/type';

const ContextProps: Array<string | number> = [
  'strokeStyle', 
  'fillStyle', 
  'globalAlpha', 
  'lineWidth', 
  'lineCap', 
  'lineJoin', 
  'miterLimit', 
  'shadowOffsetX', 
  'shadowOffsetY', 
  'shadowBlur', 
  'shadowColor', 
  'globalCompositeOperation', 
  'font', 
  'textAlign', 
  'textBaseline'
];

export default abstract class IWidget extends EventHandle{
  public config = { zIndex: 0 };
  private _parent!: BasePanel;
  public bound: Bound = {x: 0, y: 0, width: 0, height: 0};
  public destroy() {};
  public remove() {
    const parent = this.getParent();
    if (parent) {
      parent.removeWidget(this);
    }
  }
  public setParent(parent: BasePanel) {
    if (this._parent) {
      throw new Error("Current Node had parent, Pls don't set parent repeatly!");
    }
    this._parent = parent;
  }
  public getParent(): BasePanel {
    return this._parent;
  }

  public getContext(): CanvasRenderingContext2D {
    const parent = this.getParent();
    return parent.getContext();
  }

  public getBound(): Bound {
    return this.bound;
  }

  public setBound(bound: Bound) {
    this.bound = bound;
    return this;
  }
  public setCanvasContext(ctx: CanvasRenderingContext2D, config?: CommonObject) {
    ctx.save();
    if (!config) {
      config = this.getConfig();
    }
    for (const key of ContextProps) {
      if (config[key] !== undefined) {
        (ctx as any)[key] = config[key];
      }
    }
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.translate(this.bound.x, this.bound.y);
  }
  public contain(point: Point): boolean {
    return point.x > this.bound.x && point.y < this.bound.y
      && point.x - this.bound.x < this.bound.width
      && this.bound.y - point.y < this.bound.height
  }
  public onMousemove(point: Point) {}
  public abstract renderer: IRenderer;
  public abstract initWidget(): void;
  public abstract render(): void;
}