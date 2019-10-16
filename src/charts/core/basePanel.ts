import EventHandle from './eventHandle';
import { PanelOptions } from '../typeof/type';
import IWidget from './widgets/iWidget';

export default abstract class BasePanel extends EventHandle{
  public options!: PanelOptions;
  public widgets: IWidget[] = [];
  private _isWaiting: boolean = false;
  private _visibleSeriesData: any;
  constructor(options: PanelOptions) {
    super();
    this.options = options;
  }
  public getSeriesData() {
    const { seriesData = [] } = this.getConfig();
    return seriesData;
  }
  public getVisibleSeriesData() {
    return this._visibleSeriesData || this.getSeriesData();
  }

  public setVisibleSeriesData<T>(data: T) {
    this._visibleSeriesData = data;
  }

  public addWidget(widget: IWidget) {
    widget.setParent(this);
    this.widgets.push(widget);
    return this;
  }

  public addWidgets(widgets: IWidget[]) {
    for (const widget of widgets) {
      widget.setParent(this);
    }
    return this;
  }
  
  public addElement(element: HTMLElement) {
    const container = this.options.container;
    if (container && element) {
      container.appendChild(element);
    }
  }

  public update() {
    if (this._isWaiting) {
      return;
    }
    this._isWaiting = true;
    requestAnimationFrame(() => {
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
    return this;
  }
  public destroy() {}
  public abstract getExtent(): number[]
}