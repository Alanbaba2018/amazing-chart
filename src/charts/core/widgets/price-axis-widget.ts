import IWidget from './iWidget';
import PriceAxisRenderer from '../renderers/price-axis-renderer';
import { createCanvasElement } from '../../util/helper';
import { TickData } from '../../typeof/type';
import { TextBaseLine, TextAlign } from '../../typeof/const';
import Axis from '../../model/axis';

export default class PriceAxisWidget extends IWidget {
  public config = { textBaseline: TextBaseLine.Middle, textAlign: TextAlign.Left };
  public renderer = new PriceAxisRenderer();
  public render() {
    const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this.setCanvasContext(ctx);
    const { tickWidth = 5, textMargin = 5 } = this.getConfig();
    this.renderer.draw(ctx, {
      width: this.width,
      height: this.height,
      ticksData: this.getTicksData(),
      tickWidth,
      textMargin
    });
    ctx.restore();
  }
  public createElement() {
    const parent = this.getParent();
    const div  = document.createElement('div');
    div.style.position = 'absolute';
    if (parent) {
      const { marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
      this.setWidth(marginRight)
        .setHeight(height - marginBottom - marginTop)
      div.style.left = `${width - marginRight}px`;
      div.style.top = `${marginTop}px`;
      const style = {
        position: 'relative',
        width: `${this.width}px`,
        height: `${this.height}px`,
        cursor: 'ns-resize'
      };
      this._canvas = createCanvasElement(this.width, this.height, { style });
      div.appendChild(this._canvas);
    }
    return div;
  }
  public getTicksData(): TickData[] {
    const parent = this.getParent();
    if (parent) {
      const extent = parent.getExtent();
      const axis = new Axis([0, 0], extent, [0, this.height]);
      const axisData = axis.getAxisData();
      return axisData;
    }
    return [];
  }
}