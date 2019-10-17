import EventHandle from './eventHandle';
import { PanelOptions, AxisData, Point } from '../typeof/type';
import IWidget from './widgets/iWidget';
import Axis from '../model/axis';

export default abstract class BasePanel extends EventHandle{
  public options!: PanelOptions;
  public widgets: IWidget[] = [];
  private _isWaiting: boolean = false;
  private _visibleSeriesData: any;
  protected _canvas!: HTMLCanvasElement;
  protected _cacheCanvas!: HTMLCanvasElement;
  protected _ctx!: CanvasRenderingContext2D;
  protected _cacheCtx!: CanvasRenderingContext2D;
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
  public getCacheCanvas(): HTMLCanvasElement {
    return this._cacheCanvas;
  }
  public setCacheCanvas(canvas: HTMLCanvasElement) {
    this._cacheCanvas = canvas;
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

  public getCacheContext(): CanvasRenderingContext2D {
    if (!this._cacheCtx) {
      this.setCacheContext(this._cacheCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
    return this._cacheCtx;
  }

  public setCacheContext(ctx: CanvasRenderingContext2D) {
    this._cacheCtx = ctx;
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

  protected clearPanel() {
    if (this._ctx) {
      const { width = 0, height = 0 } = this.getConfig();
      this._ctx.clearRect(0, 0, width, height);
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