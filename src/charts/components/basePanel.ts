import EventHandle from './eventHandle';
import { PanelOptions } from '../typeof/type';
import IWdget from './widgets/iWidget';

export default abstract class BasePanel extends EventHandle{
  public options!: PanelOptions;
  public widgets: IWdget[] = [];
  constructor(options: PanelOptions) {
    super();
    this.options = options;
  }
  public addWidget(widget: IWdget) {
    this.widgets.push(widget);
    return this;
  }
  public addWidgets(widgets: IWdget[]) {
    this.widgets.push(...widgets);
    return this;
  }
  
  public update() {
    for (const widget of this.widgets) {
      widget.render();
    }
  }
  public destroy() {}
  public abstract buildPanels(): void;
}