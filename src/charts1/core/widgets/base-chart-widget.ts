import IWidget from './iWidget'
import { CommonObject, TickData } from '../../typeof/type'
import { setElementStyle, setCanvasContextStyle, formatTime } from '../../util/helper'
import Canvas from '../canvas'
import TimeAxis from '../../model/time-axis'
import IPanel from './IPanel'

export default abstract class BaseChartWidget extends IWidget {
  private defaultConfig = { zIndex: 1, showClose: false, iconSize: 40, margin: 10 }

  constructor() {
    super()
    this._initEvents()
    this.setAttrs(this.defaultConfig)
  }

  private _initEvents() {
    const isMobile = this.getAttr('isMobile')
    // remove mousemove event when env is mobile
    !isMobile && this.on('mousemove', this.mousemove.bind(this))
    this.on('mouseout', this.onmouseout.bind(this))
    this.on('mousedown', this.onmousedown.bind(this))
    this.on('mousewheel', this.onmousewheel.bind(this))
  }

  public setViewBound() {
    const root = this.getRoot()
    const parent = this.getParent() as IPanel
    const bound = parent.getBound()
    const yAxis = root.getAttr('yAxis')
    this.setBound({
      x: bound.x,
      y: bound.y,
      width: bound.width - yAxis.width,
      height: bound.height,
    })
  }

  public getXYTicksData() {
    const root = this.getRoot()
    const parent = this.getParent() as IPanel
    const xAxisData = root.getXAxis().getAxisData()
    const yAxisData = parent.yAxis.getAxisData()
    return {
      xData: xAxisData.map((tickData: TickData) => tickData.p),
      yData: yAxisData.map((tickData: TickData) => tickData.p),
    }
  }

  private mousemove(evt: any) {
    const root = this.getRoot()
    const parent = this.getParent() as IPanel
    if (!this.getAttr('isMouseover')) {
      setElementStyle(root.getHitCanvas(), { cursor: 'crosshair' })
    }
    const { show: isShowCrossLine = false } = root.getAttr('crossHair')
    if (!isShowCrossLine) return
    const _hitCtx = root.getHitContext()
    const xAxis = root.getXAxis()
    const { visibleViewHeight } = root
    const { yAxis } = parent
    const { lineColor, xLabelColor, yLabelColor, labelBackground } = root.getAttr('crossHair')
    const viewPoint = this.transformPointToView(evt.point)
    const xValue = xAxis.getValueOfCoord(viewPoint.x)
    viewPoint.x = xAxis.getCoordOfValue(xValue)
    Canvas.clearRect(_hitCtx)
    _hitCtx.save()
    this.setCanvasTransform(_hitCtx)
    setCanvasContextStyle(_hitCtx, { strokeStyle: lineColor })
    const margin = root.getAttr('margin')
    const { y, width } = this.bound
    const extent = { minX: 0, minY: margin.top - y, maxX: width, maxY: visibleViewHeight - y }
    this.renderer.drawCrossLine(_hitCtx, viewPoint, extent)
    const xLabel = {
      point: { x: viewPoint.x, y: visibleViewHeight - this.bound.y },
      text: formatTime(xValue),
      color: xLabelColor,
    }
    const yLabel = {
      point: { x: this.bound.width, y: viewPoint.y },
      text: yAxis.getValueOfCoord(viewPoint.y).toFixed(2),
      color: yLabelColor,
    }
    const bgColor = labelBackground
    this.renderer.drawAxisValueLabel(_hitCtx, { xLabel, yLabel, bgColor })
    _hitCtx.restore()
  }

  private onmouseout() {
    const parent = this.getRoot()
    const _hitCtx = parent.getHitContext()
    Canvas.clearRect(_hitCtx)
    this.clearDragEvent()
  }

  private onmousedown(evt: any) {
    const _evt = evt.originEvent as TouchEvent
    if (_evt.touches && _evt.touches.length === 2) {
      this.onmousescale(evt)
      return
    }
    let { x: startX } = evt.point
    this.on('mousemove.mousedown', (e: any) => {
      const { x: moveX } = e.point
      this.getRoot().shiftTimeLine(startX - moveX)
      startX = moveX
    })
    this.on('mouseup.mousedown', this.clearDragEvent)
  }

  private onmousescale(evt: any) {
    const parent = this.getRoot()
    const timeAxis = parent.getXAxis()
    const { clientX, clientX1 } = evt
    let dis1 = Math.abs(clientX - clientX1)
    const centerTime = timeAxis.getValueOfCoord((clientX1 + clientX) / 2)
    this.on('mousemove.mousedown', (e: any) => {
      const { clientX: mClientX, clientX1: mClientX1 } = e
      const dis2 = Math.abs(mClientX - mClientX1)
      if (dis2 > dis1) {
        parent.zoomIn(centerTime)
      } else {
        parent.zoomOut(centerTime)
      }
      dis1 = dis2
    })
    this.on('mouseup.mousedown', this.clearDragEvent)
  }

  private onmousewheel(data: CommonObject) {
    const {
      originEvent: { deltaY },
      point,
    } = data
    const parent = this.getRoot()
    const timeAxis = parent.getXAxis() as TimeAxis
    const timeValue = timeAxis.getValueOfCoord(point.x)
    // deltaY > 0 ? 1.05 : 0.95;
    // zoomIn and zoomOut should be reciprocal relationship
    if (deltaY > 0) {
      parent.zoomIn(timeValue)
    } else {
      parent.zoomOut(timeValue)
    }
  }

  private clearDragEvent() {
    this.off('mousemove.mousedown')
    this.off('mouseup.mousedown')
  }
}
