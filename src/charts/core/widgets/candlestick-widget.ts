import IWidget from './iWidget';
import CandlestickRenderer from '../renderers/candlestick-renderer';
import { createCanvasElement } from '../../util/helper';

export default class CandlestickWidget extends IWidget {
  public renderer = new CandlestickRenderer();
  public render() {
    const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this.setCanvasContext(ctx);
    this.renderer.draw();
  }
  public createElement() {
    const parent = this.getParent();
    const div  = document.createElement('div');
    div.style.position = 'absolute';
    if (parent) {
      const { marginLeft, marginRight, marginBottom, marginTop, width, height } = parent.getConfig();
      this.setWidth(width - marginLeft - marginRight)
        .setHeight(height - marginBottom - marginTop);
      div.style.left = `${marginLeft}px`;
      div.style.top = `${marginTop}px`;
      const style = {
        position: 'relative',
        width: `${this.width}px`,
        height: `${this.height}px`
      };
      this._canvas = createCanvasElement(this.width, this.height, { style });
      div.appendChild(this._canvas);
    }
    return div;
  }
}