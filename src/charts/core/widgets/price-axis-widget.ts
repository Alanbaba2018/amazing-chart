import IWidget from './iWidget';
import PriceAxisRenderer from '../renderers/price-axis-renderer';
import { TickData, CommonObject } from '../../typeof/type';
import { setElementStyle } from '../../util/helper';
import Canvas from '../canvas';

export default class PriceAxisWidget extends IWidget {
  public config = { zIndex: 1000 };
  public renderer = new PriceAxisRenderer();
  constructor() {
    super();
    this.on('mousemove', this.onmousemove.bind(this));
    this.on('mousewheel', this.onmousewheel.bind(this));
  }
  public render() {
    const parent = this.getParent();
    const { yAxis: config, background } = parent.getConfig();
    const ctx: CanvasRenderingContext2D = parent.getAxisContext();
    ctx.save();
    this.setCanvasTransform(ctx);
    this.setCanvasContextStyle(ctx, config);
    Canvas.drawBackground(ctx, background, { ...this.bound, x: 0, y: -this.bound.height});
    const { tickWidth, textMargin } = config;
    this.renderer.draw(ctx, {
      bound: this.bound,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin
    });
    
    ctx.restore();
  }
  public setWidgetBound() {
    const parent = this.getParent();
    const { marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
    this.setBound({
      x: width - marginRight,
      y: height - marginBottom,
      width: marginRight,
      height: height - marginBottom - marginTop
    });
  }
  public getTicksData(): TickData[] {
    const parent = this.getParent();
    const axis = parent.getYAxis();
    const axisData = axis.getAxisData();
    return axisData;
  }
  public onmousemove() {
    if (!this.getAttr('isMouseover')) {
      setElementStyle(this.getParent().getHitCanvas(), { cursor: 'ns-resize'});
    }
  }
  public onmousewheel(data: CommonObject) {
    const { deltaY } = data.originEvent;
    const parent = this.getParent();
    const yAxis = parent.getYAxis();
    const coeff = deltaY > 0 ? 1.05 : 0.95;
    yAxis.scaleAroundCenter(coeff);
    parent.update();
  }
}