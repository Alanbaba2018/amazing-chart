import EventHandle from './eventHandle';
import { PanelOptions, AxisData, Point, Bound } from '../typeof/type';
import { DevicePixelRatio } from '../typeof/const';
import IWidget from './widgets/iWidget';
import Axis from '../model/axis';
import Canvas from './canvas';

export default abstract class BasePanel extends EventHandle{
  public options!: PanelOptions;
  public widgets: IWidget[] = [];
  private _isWaiting: boolean = false;
  // 主canvas图层
  protected _canvas!: HTMLCanvasElement;
  protected _cacheCanvas!: HTMLCanvasElement;
  // 背景色canvas图层
  protected _bgCanvas!: HTMLCanvasElement;
  protected _ctx!: CanvasRenderingContext2D;
  // 鼠标移动动态canvas图层
  protected _hitCtx!: CanvasRenderingContext2D;
  protected _bgCtx!: CanvasRenderingContext2D;
  // 坐标轴canvas图层
  protected _axisCanvas!: HTMLCanvasElement;
  protected _axisCtx!: CanvasRenderingContext2D;
  protected _xAxis!: Axis;
  protected _yAxis!: Axis;
  constructor(options: PanelOptions) {
    super();
    this.options = options;
    window.addEventListener('resize', this.resize.bind(this));
  }
  public getSeriesData() {
    const { seriesData = [] } = this.getConfig();
    return seriesData;
  }
  public getVisibleSeriesData<T>(): T {
    return this.getAttr('visibleSeriesData') || this.getSeriesData();
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
  public getAxisCanvas(): HTMLCanvasElement {
    return this._axisCanvas;
  }
  public setAxisCanvas(canvas: HTMLCanvasElement) {
    this._axisCanvas = canvas;
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
    return this;
  }

  public getBgContext(): CanvasRenderingContext2D {
    if (!this._bgCtx) {
      this.setBgContext(this._bgCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
    return this._bgCtx;
  }

  public setBgContext(ctx: CanvasRenderingContext2D) {
    this._bgCtx = ctx;
    return this;
  }
  public getAxisContext(): CanvasRenderingContext2D {
    if (!this._axisCtx) {
      this.setAxisContext(this._axisCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
    return this._axisCtx;
  }

  public setAxisContext(ctx: CanvasRenderingContext2D) {
    this._axisCtx = ctx;
    return this;
  }

  public getXAxis(): Axis {
    return this._xAxis;
  }
  public getYAxis(): Axis {
    return this._yAxis;
  }

  public addWidget(widget: IWidget) {
    widget.setParent(this);
    this.widgets.push(widget);
    widget.setWidgetBound();
    this.sortWidgets();
    return this;
  }

  public addWidgets(widgets: IWidget[]) {
    for (const widget of widgets) {
      widget.setParent(this);
      this.widgets.push(widget);
      widget.setWidgetBound();
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
      this._isWaiting = false;
    })
  }

  public resize() {
    const container = this.options.container;
    if (container) {
      this.setAttrs({width: container.clientWidth, height: container.clientHeight});
    }
    this.updateContainerSize();
    this.eachWidgets((widget: IWidget) => widget.setWidgetBound());
    const background = this.getAttr('background');
    background && this.setPanelBackground(background);
    this.update();
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
    const axisCtx = this.getAxisContext();
    Canvas.clearRect(ctx, bound);
    Canvas.clearRect(axisCtx, bound);
  }
  protected setPanelBackground(color: string) {
    const ctx = this.getBgContext();
    if (ctx) {
      ctx.save();
      ctx.scale(DevicePixelRatio, DevicePixelRatio);
      const { width = 0, height = 0 } = this.getConfig();
      Canvas.drawBackground(ctx, color, { x: 0, y: 0, width, height });
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
  public abstract getYExtent(): number[];
  public abstract updateContainerSize(): void;
  public updateTimeExtend(px: number) {};
  public updateYExtend() {};
  public getTimeExtent(): number[] {
    return [];
  }
}