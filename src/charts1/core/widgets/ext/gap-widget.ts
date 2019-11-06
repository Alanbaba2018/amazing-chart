import IWidget from '../iWidget'
import GapRenderer from '../../renderers/ext/gap-renderer'
import { setCanvasContextStyle, setElementStyle } from '../../../util/helper'
import { ColorMap, GapWidgetHeight } from '../../../typeof/type'
import BasePanel from '../../basePanel'

export default class GapWidget extends IWidget {
  public config = { zIndex: 100 }

  public renderer = new GapRenderer()

  private _frontPanel: BasePanel | null

  private _nextPanel: BasePanel

  public get frontPanel(): BasePanel | null {
    return this._frontPanel
  }

  public get nextPanel(): BasePanel {
    return this._nextPanel
  }

  constructor(frontPanel: BasePanel | null, nextPanel: BasePanel) {
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
    const root = this.getRoot()
    const { margin, width } = root.getConfig()
    const { extPanels } = root
    if (this._frontPanel) {
      const frontPanelBound = this._frontPanel.getBound()
      this.setBound({
        x: margin.left,
        y: frontPanelBound.x + GapWidgetHeight,
        width: width - margin.left - margin.right,
        height: GapWidgetHeight,
      })
    } else {
      const weight = 1 / (extPanels.length + 1)
      this.setBound({
        x: margin.left,
        y: margin.top + root.visibleViewHeight *weight + GapWidgetHeight,
        width: width - margin.left - margin.right,
        height: GapWidgetHeight,
      })
    }
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
      console.log(moveY - startY)
      startY = moveY
    })
    this.on('mouseup.mousedown', this._clearDragEvent)
  }

  private _clearDragEvent() {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }
}
