import EventHandle from '../eventHandle';
import IRenderer from '../renderers/iRenderer';
import BasePanel from '../basePanel';

const ContextProps: string[] = [
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
  private _parent!: BasePanel;
  protected _canvas!: HTMLCanvasElement;
  public width: number = 0;
  public height: number = 0;
  constructor() {
    super();
    this.registerAttrsReflect();
  }
  public abstract render(): void;
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
    
    this._parent.addElement(this.createElement());
  }
  public getParent(): BasePanel {
    return this._parent;
  }
  public setWidth(width: number) {
    this.width = width;
    return this;
  }
  public setHeight(height: number) {
    this.height = height;
    return this;
  }
  public setCanvasContext(ctx: CanvasRenderingContext2D) {
    this.clearCanvas(ctx);
    ctx.save();
    for (const key of ContextProps) {
      if (this.config[key]) {
        (ctx as any)[key] = this.config[key];
      }
    }
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.translate(0, this.height);
  }
  public clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
  }
  public abstract renderer: IRenderer;
  public abstract createElement(): HTMLElement;
}