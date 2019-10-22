import IWidget from './iWidget';
import CandlestickRenderer from '../renderers/candlestick-renderer';
import { Point } from '../../typeof/type';
import { setElementStyle, getShowDateLabel } from '../../util/helper';
import Candlestick from '../candlestick/candlestick';
import Canvas from '../canvas';
import TimeAxis from '../../model/time-axis';

export default class CandlestickWidget extends IWidget {
  public config = { zIndex: 1 };
  public renderer = new CandlestickRenderer();
  constructor() {
    super();
    this.on('mousemove', this.mousemove.bind(this));
    this.on('mouseout', this.onmouseout.bind(this));
    this.on('mousedown', this.onmousedown.bind(this));
  }
  public render() {
    const config = this.getParent().getAttr('candlestick');
    const ctx: CanvasRenderingContext2D = this.getContext();
    ctx.save();
    this.setCanvasTransform(ctx);
    this.setCanvasContextStyle(ctx, config);
    this.renderer.draw(this.getContext(), this.getVisibleBars(), config);
    ctx.restore();
  }
  public setWidgetBound() {
    const parent = this.getParent();
    const { marginLeft, marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
    this.setBound({
      x: marginLeft,
      y: height - marginBottom,
      width: width - marginLeft - marginRight,
      height: height - marginBottom - marginTop
    });
  }
  public getVisibleBars() {
    const parent = this.getParent() as Candlestick;
    return parent.getVisibleBars();
  }
  public mousemove(evt: any) {
    const parent = this.getParent();
    const _hitCtx = parent.getHitContext();
    Canvas.clearRect(_hitCtx);
    const { crossLine: config } = parent.getConfig();
    _hitCtx.save();
    this.setCanvasTransform(_hitCtx);
    this.setCanvasContextStyle(_hitCtx, { strokeStyle: config.strokeStyle });
    const viewPoint = this.transformPointToView(evt.point);
    this.renderer.drawCrossLine(_hitCtx, viewPoint, this.getBound());
    const xAxis = parent.getXAxis();
    const yAxis = parent.getYAxis();
    const labels = {
      xLabel: { 
        point: { x: viewPoint.x, y: 0 },
        text: getShowDateLabel(xAxis.getValueOfCoord(viewPoint.x), (xAxis as TimeAxis).timeScaleType, 'YYYY-MM-DD hh:mm:ss'),
        color: config.xLabelColor
      },
      yLabel: {
        point: { x: this.bound.width, y: viewPoint.y },
        text: yAxis.getValueOfCoord(viewPoint.y).toFixed(2),
        color: config.yLabelColor
      },
      bgColor: config.background
    };
    this.renderer.drawAxisValueLabel(_hitCtx, labels);
    if (!this.getAttr('isMouseover')) {
      setElementStyle(parent.getHitCanvas(), { cursor: 'crosshair'});
    }
    _hitCtx.restore();
  }
  private onmouseout() {
    const parent = this.getParent();
    const _hitCtx = parent.getHitContext();
    Canvas.clearRect(_hitCtx);
    this.clearDragEvent();
  }
  private onmousedown(evt: any) {
    let { x: startX } = evt.point;
    this.on('mousemove.mousedown', (e: any) => {
      const { x: moveX } = e.point;
      this.getParent().updateTimeExtend(startX - moveX);
      startX = moveX;
    });
    this.on('mouseup.mousedown', this.clearDragEvent)
  }
  private clearDragEvent() {
    this.off('mousemove.mousedown');
    this.off('mouseup.mousedown');
  }
  public transformPointToView(point: Point): Point {
    const { marginLeft, marginTop } = this.getParent().getConfig();
    return {
      x: point.x - marginLeft,
      y: this.bound.height - (point.y - marginTop)
    }
  }
}