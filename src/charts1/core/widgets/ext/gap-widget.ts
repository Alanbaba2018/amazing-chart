import IWidget from '../iWidget'
import GapRenderer from '../../renderers/ext/gap-renderer'
import { setCanvasContextStyle, setElementStyle } from '../../../util/helper'
import { ColorMap } from '../../../typeof/type'
import { GapWidgetHeight } from '../../../typeof/constant'
import IPanel from '../IPanel'

export default class GapWidget extends IWidget {
  public config = { zIndex: 100 }

  public renderer = new GapRenderer()

  private _frontPanel: IPanel

  private _nextPanel: IPanel

  public get frontPanel(): IPanel {
    return this._frontPanel
  }

  public set frontPanel(panel: IPanel) {
    this._frontPanel = panel
  }

  public get nextPanel(): IPanel {
    return this._nextPanel
  }

  public set nextPanel(panel: IPanel) {
    this._nextPanel = panel
  }

  constructor(frontPanel: IPanel, nextPanel: IPanel) {
    super()
    this._frontPanel = frontPanel
    this._nextPanel = nextPanel
    this._initEvents()
  }

  public render() {
    const parent = this.getRoot()
    const frameCtx = parent.getFrameContext()
    frameCtx.save()
    this.setCanvasTransform(frameCtx)
    setCanvasContextStyle(frameCtx, { fillStyle: ColorMap.Black, strokeStyle: ColorMap.Gray })
    this.renderer.draw(frameCtx, this.bound)
    frameCtx.restore()
  }

  public setViewBound() {
    const frontPanelBound = this._frontPanel.getBound()
    this.setBound({
      ...frontPanelBound,
      y: frontPanelBound.y + GapWidgetHeight,
      height: GapWidgetHeight,
    })
  }

  private _initEvents() {
    this.on('mousemove', this._onmousemove.bind(this))
    this.on('mouseout', this._clearDragEvent)
    this.on('mousedown', this._onmousedown.bind(this))
  }

  private _onmousemove() {
    if (!this.getAttr('isMouseover')) {
      const parent = this.getRoot()
      setElementStyle(parent.getHitCanvas(), { cursor: 'ns-resize' })
    }
  }

  private _onmousedown(evt: any) {
    let { y: startY } = evt.point
    this.on('mousemove.mousedown', (e: any) => {
      const { y: moveY } = e.point
      const dy = moveY - startY
      this._frontPanel.updateViewBoundHeight(dy, dy)
      this.setBound({ ...this.bound, y: this.bound.y + dy })
      this._nextPanel.updateViewBoundHeight(-dy, 0)
      startY = moveY
    })
    this.on('mouseup.mousedown', this._clearDragEvent)
  }

  private _clearDragEvent() {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }
}
