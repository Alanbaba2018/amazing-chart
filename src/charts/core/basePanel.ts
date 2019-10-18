import EventHandle from './eventHandle';
import { PanelOptions, AxisData, Point, Bound } from '../typeof/type';
import IWidget from './widgets/iWidget';
import Axis from '../model/axis';
import Canvas from './canvas';

export default abstract class BasePanel extends EventHandle{
  public options!: PanelOptions;
  public widgets: IWidget[] = [];
  private _isWaiting: boolean = false;
  private _visibleSeriesData: any;
  protected _canvas!: HTMLCanvasElement;
  protected _cacheCanvas!: HTMLCanvasElement;
  protected _bgCanvas!: HTMLCanvasElement;
  protected _ctx!: CanvasRenderingContext2D;
  protected _hitCtx!: CanvasRenderingContext2D;
  protected _bgCtx!: CanvasRenderingContext2D;
  protected _xAxis!: Axis;
  protected _yAxis!: Axis;
  constructor(options: PanelOptions) {
    super();
    this.options = options;
  }
  public getSeriesData() {
    const { seriesData = [] } = this.getConfig();
    return seriesData;
  }
  public getVisibleSeriesData<T>(): T {
    return this._visibleSeriesData || this.getSeriesData();
  }
  public getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }
  public setCanvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    return this;
  }
  public getHitCanvas(): HTMLCanvasElement {
    return this._cacheCanvas;
  }
  public seHitCanvas(canvas: HTMLCanvasElement) {
    this._cacheCanvas = canvas;
    return this;
  }
  public getBgCanvas(): HTMLCanvasElement {
    return this._bgCanvas;
  }
  public setBgCanvas(canvas: HTMLCanvasElement) {
    this._bgCanvas = canvas;
    return this;
  }
  public getContext(): CanvasRenderingContext2D {
    if (!this._ctx) {
      this.setContext(this._canvas.getContext('2d') as CanvasRenderingContext2D);
    }
    return this._ctx;
  }
  public setContext(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    return this;
  }

  public getHitContext(): CanvasRenderingContext2D {
    if (!this._hitCtx) {
      this.setCacheContext(this._cacheCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
    return this._hitCtx;
  }

  public setCacheContext(ctx: CanvasRenderingContext2D) {
    this._hitCtx = ctx;
  }

  public getBgContext(): CanvasRenderingContext2D {
    if (!this._bgCtx) {
      this.setBgContext(this._bgCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
    return this._bgCtx;
  }

  public setBgContext(ctx: CanvasRenderingContext2D) {
    this._bgCtx = ctx;
  }

  public getXAxis(): Axis {
    return this._xAxis;
  }
  public getYAxis(): Axis {
    return this._yAxis;
  }
  public setVisibleSeriesData<T>(data: T) {
    this._visibleSeriesData = data;
  }

  public addWidget(widget: IWidget) {
    widget.setParent(this);
    this.widgets.push(widget);
    this.sortWidgets();
    return this;
  }

  public addWidgets(widgets: IWidget[]) {
    for (const widget of widgets) {
      this.widgets.push(widget);
      widget.setParent(this);
    }
    this.sortWidgets();
    return this;
  }
  
  public addElement(element: HTMLElement) {
    const container = this.options.container;
    if (container && element) {
      container.appendChild(element);
    }
  }

  public eachWidgets(callback: Function) {
    for (const widget of this.widgets) {
      callback.call(this, widget);
    }

  }
  public update() {
    if (this._isWaiting) {
      return;
    }
    this._isWaiting = true;
    requestAnimationFrame(() => {
      this.clearPanel();
      for (const widget of this.widgets) {
        widget.render();
      }
      console.log(`redraw: ${Date.now()}`);
      this._isWaiting = false;
    })
  }

  public removeWidget(widget: IWidget) {
    for (let i = 0; i < this.widgets.length; i++) {
      if (this.widgets[i] === widget) {
        this.widgets.splice(i, 1);
        break;
      }
    }
    this.sortWidgets();
    return this;
  }

  public clearPanel(bound?: Bound) {
    const ctx = this.getContext();
    if (ctx) {
      const { x = 0, y = 0, width = 0, height = 0 } = bound || this.getConfig();
      ctx.clearRect(x, y, width, height);
    }
  }
  protected setPanelBackground(color: string) {
    const ctx = this.getBgContext();
    if (ctx) {
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const { width = 0, height = 0 } = this.getConfig();
      Canvas.drawBackground(ctx, { x: 0, y: 0, width, height }, color);
      ctx.restore();
    }
  }
  protected sortWidgets() {
    this.widgets.sort((widgetA: IWidget, widgetB: IWidget) => {
      const zIndexA = widgetA.getConfig().zIndex;
      const zIndexB = widgetB.getConfig().zIndex;
      return zIndexA - zIndexB;
    })
  }
  public initContainer() {};
  public destroy() {}
  public abstract getAxisData(): AxisData;
  public abstract getPositonByValue(xValue: number, yValue: number): Point;
  public abstract getYExtent(): number[]
  public getTimeExtent(): number[] {
    return [];
  }
}