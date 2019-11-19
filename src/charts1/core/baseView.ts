import EventHandle from './eventHandle'
import IPanel from './widgets/IPanel'
import IWidget from './widgets/iWidget'
import { CandlestickItem, DrawMode, IndicatorView } from '../typeof/type'
import GapWidget from './widgets/ext/gap-widget'

export default abstract class BaseView extends EventHandle {
  protected panels: Array<IPanel | IWidget> = []

  protected _indicatorViews: Map<string, IndicatorView> = new Map()

  private _isWaiting: boolean = false

  public get indicatorViews(): IndicatorView[] {
    return Array.from(this._indicatorViews.values())
  }

  public addPanels(panels: Array<IPanel | IWidget>) {
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

  public update(drawMode: DrawMode = DrawMode.All) {
    if (this._isWaiting) {
      return
    }
    this._isWaiting = true
    requestAnimationFrame(() => {
      this.clearPanel(drawMode)
      this.panels.forEach(panel => {
        if (panel instanceof IPanel) {
          panel.updateImmediate(drawMode)
        } else {
          panel.render(drawMode)
        }
      })
      this._isWaiting = false
    })
  }

  public removePanel(panel: IPanel | IWidget) {
    for (let i = 0; i < this.panels.length; i++) {
      if (this.panels[i] === panel) {
        this.panels.splice(i, 1)
        break
      }
    }
    return this
  }

  public removePanels(panelSet: Set<IPanel | IWidget>) {
    for (let i = this.panels.length - 1; i >= 0; i--) {
      const currentPanel = this.panels[i]
      if (panelSet.has(currentPanel)) {
        this.panels.splice(i, 1)
        panelSet.delete(currentPanel)
        if (currentPanel instanceof IPanel) {
          this._indicatorViews.delete(currentPanel.getAttr('indicatorType'))
        }
        if (panelSet.size === 0) return
      }
    }
  }

  public initPanelBound() {
    this.eachPanels(panel => {
      panel.setViewBound()
    })
  }

  public updatePanelBound() {
    const allWeight = this.panels.reduce(
      (acc: number, cur: IPanel | IWidget) => (cur instanceof IPanel ? acc + cur.weight : acc),
      0,
    )
    this.eachPanels(panel => {
      panel instanceof IPanel && panel.updateViewBound(allWeight)
      panel instanceof GapWidget && panel.setViewBound()
    })
  }

  public resizeAllPanelBound() {
    this.eachPanels(panel => {
      panel instanceof IPanel ? panel.updateViewBound() : panel.setViewBound()
    })
  }

  public initPanelYAxis() {
    this.eachPanels(panel => {
      if (panel instanceof IPanel) {
        panel.setYAxis()
      }
    })
  }

  public filterPanels(callback: Function): Array<IPanel | IWidget> {
    return this.panels.filter(panel => callback.call(this, panel))
  }

  public getSeriesData(): CandlestickItem[] {
    const { seriesData = [] } = this.getConfig()
    return seriesData
  }

  public getVisibleSeriesData(): CandlestickItem[] {
    return this.getAttr('visibleSeriesData') || this.getSeriesData()
  }

  public abstract clearPanel(drawMode: DrawMode): void

  public abstract setWidgetParent(panel: IPanel | IWidget): void
}
