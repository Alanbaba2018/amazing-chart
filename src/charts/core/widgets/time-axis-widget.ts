import IWidget from './iWidget';
import TimeAxisRenderer from '../renderers/time-axis-renderer';
import { createCanvasElement } from '../../util/helper';

export default class TimeAxisWidget extends IWidget {
  public renderer = new TimeAxisRenderer();
  public render() {
    const ctx: CanvasRenderingContext2D = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this.setCanvasContext(ctx);
    this.renderer.draw(ctx, {width: this.width, height: this.height});
    ctx.restore();
  }
  public createElement() {
    const parent = this.getParent();
    const div  = document.createElement('div');
    div.style.position = 'absolute';
    if (parent) {
      const { marginLeft, marginRight, marginBottom, width, height } = parent.getConfig();
      this.setWidth(width - marginLeft - marginRight + 0.5)
        .setHeight(marginBottom);
      div.style.left = `${marginLeft}px`;
      div.style.top = `${height - marginBottom}px`;
      const style = {
        position: 'relative',
        width: `${this.width}px`,
        height: `${this.height}px`,
        cursor: 'ew-resize'
      };
      this._canvas = createCanvasElement(this.width, this.height, { style });
      div.appendChild(this._canvas);
    }
    return div;
  }
}