import EventHandle from './eventHandle'
import IWidget from './widgets/iWidget'

export default abstract class BasePanel extends EventHandle {
  public widgets: IWidget[] = []

  private _isWaiting: boolean = false

  public getSeriesData() {
    const { seriesData = [] } = this.getConfig()
    return seriesData
  }

  public getVisibleSeriesData<T>(): T {
    return this.getAttr('visibleSeriesData') || this.getSeriesData()
  }

  public addWidget(widget: IWidget) {
    this.setWidgetParent(widget)
    this.widgets.push(widget)
    widget.setWidgetBound()
    this.sortWidgets()
    return this
  }

  public addWidgets(widgets: IWidget[]) {
    widgets.forEach(widget => {
      this.setWidgetParent(widget)
      this.widgets.push(widget)
      widget.setWidgetBound()
    })
    this.sortWidgets()
    return this
  }

  public addElement(element: HTMLElement) {
    const container = this.getAttr('container')
    if (container && element) {
      container.appendChild(element)
    }
  }

  public addElemens(elements: HTMLElement[]) {
    const container = this.getAttr('container')
    elements.forEach(element => container.appendChild(element))
  }

  public eachWidgets(callback: Function) {
    this.widgets.forEach(widget => {
      callback.call(this, widget)
    })
  }

  public update() {
    if (this._isWaiting) {
      return
    }
    this._isWaiting = true
    requestAnimationFrame(() => {
      this.clearPanel()
      this.widgets.forEach(widget => {
        widget.render()
      })
      this._isWaiting = false
    })
  }

  public removeWidget(widget: IWidget) {
    for (let i = 0; i < this.widgets.length; i++) {
      if (this.widgets[i] === widget) {
        this.widgets.splice(i, 1)
        break
      }
    }
    this.sortWidgets()
    return this
  }

  public abstract clearPanel(): void

  public abstract setWidgetParent(widget: IWidget): void

  protected sortWidgets() {
    this.widgets.sort((widgetA: IWidget, widgetB: IWidget) => {
      const zIndexA = widgetA.getConfig().zIndex
      const zIndexB = widgetB.getConfig().zIndex
      return zIndexA - zIndexB
    })
  }
}
