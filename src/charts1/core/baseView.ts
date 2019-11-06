import EventHandle from './eventHandle'
import BasePanel from './basePanel'
import IWidget from './widgets/iWidget'
import { CandlestickItem } from '../typeof/type'

export default abstract class BaseView extends EventHandle {
  protected panels: Array<BasePanel | IWidget> = []

  private _isWaiting: boolean = false

  public addPanels(panels: Array<BasePanel | IWidget>) {
    panels.forEach(panel => {
      this.setWidgetParent(panel)
      this.panels.push(panel)
    })
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

  public eachPanels(callback: Function) {
    this.panels.forEach(panel => {
      callback.call(this, panel)
    })
  }

  public update() {
    if (this._isWaiting) {
      return
    }
    this._isWaiting = true
    requestAnimationFrame(() => {
      this.clearPanel()
      this.panels.forEach(panel => {
        if (panel instanceof BasePanel) {
          panel.update()
        } else {
          panel.render()
        }
      })
      this._isWaiting = false
    })
  }

  public removePanel(panel: BasePanel | IWidget) {
    for (let i = 0; i < this.panels.length; i++) {
      if (this.panels[i] === panel) {
        this.panels.splice(i, 1)
        break
      }
    }
    return this
  }

  public initPanelBound() {
    this.eachPanels(panel => {
      if (panel instanceof BasePanel) {
        panel.setPanelBound()
      }
    })
  }

  public initPanelYAxis() {
    this.eachPanels(panel => {
      if (panel instanceof BasePanel) {
        panel.initialYAxis()
      }
    })
  }

  public getSeriesData(): CandlestickItem[] {
    const { seriesData = [] } = this.getConfig()
    return seriesData
  }

  public getVisibleSeriesData(): CandlestickItem[] {
    return this.getAttr('visibleSeriesData') || this.getSeriesData()
  }

  public abstract clearPanel(): void

  public abstract setWidgetParent(panel: BasePanel | IWidget): void
}
