import IRenderer from './iRenderer';
import { Point, Bound, CandlestickBar, Trend, CommonObject } from '../../typeof/type';
import { TextBaseLine, TextAlign } from '../../typeof/const';

interface TextLabel {
  point: Point;
  text: string;
  color: string;
}
export default class CandlestickRenderer extends IRenderer {
  public draw(ctx: CanvasRenderingContext2D, data: CandlestickBar[], config: CommonObject) {
    // console.log('-----------------draw CandlestickRenderer----------------');
    this.drawCandlestickBars(ctx, data, config);
    ctx.restore();
  }
  public drawCrossLine(ctx: CanvasRenderingContext2D, focusPoint: Point, bound: Bound) {
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    this.drawLine(ctx, 0, -focusPoint.y, bound.width, -focusPoint.y);
    this.drawLine(ctx, focusPoint.x, 0, focusPoint.x, -bound.height);
    ctx.closePath();
    ctx.stroke();
  }
  public drawAxisValueLabel(ctx: CanvasRenderingContext2D, labels: { xLabel: TextLabel, yLabel: TextLabel, bgColor: string }) {
    // 刻度线宽度
    const tickWidth = 5;
    // 文字偏移距离
    const textMargin = 3;
    const rectHeight = 20;
    const { xLabel, yLabel } = labels;
    ctx.fillStyle = labels.bgColor;
    let textWidth = Math.ceil(ctx.measureText(yLabel.text).width) + (tickWidth + textMargin)* 2;
    // draw marker rect
    ctx.fillRect(yLabel.point.x, -yLabel.point.y - rectHeight / 2, textWidth, rectHeight);
    textWidth = Math.ceil(ctx.measureText(xLabel.text).width) + (tickWidth + textMargin)* 2;
    ctx.fillRect(xLabel.point.x - textWidth / 2, 0, textWidth, rectHeight + textMargin );
    ctx.fill();
    // draw Y label
    ctx.textAlign = TextAlign.Left;
    ctx.textBaseline = TextBaseLine.Middle;
    ctx.fillStyle = yLabel.color;
    ctx.fillText(yLabel.text, yLabel.point.x + tickWidth + textMargin, -yLabel.point.y);
    // draw X label
    ctx.textAlign = TextAlign.Center;
    ctx.textBaseline = TextBaseLine.Top;
    ctx.fillStyle = xLabel.color;
    ctx.fillText(xLabel.text, xLabel.point.x, -xLabel.point.y + tickWidth + textMargin);

    // 绘制marker刻度线
    ctx.beginPath();
    ctx.setLineDash([]);
    this.drawLine(ctx, yLabel.point.x, -yLabel.point.y, yLabel.point.x + tickWidth, -yLabel.point.y);
    this.drawLine(ctx, xLabel.point.x, -xLabel.point.y, xLabel.point.x, -xLabel.point.y + tickWidth);
    ctx.closePath();
    ctx.stroke();
  }
  public drawCandlestickBars(ctx: CanvasRenderingContext2D, bars: CandlestickBar[], config: CommonObject) {
    // draw red bars
    ctx.fillStyle = config[Trend.Up].fillStyle;
    ctx.strokeStyle = config[Trend.Up].strokeStyle;
    ctx.beginPath();
    for (const bar of bars) { 
      const type = bar.type;
      const { x, y, width, height } = this.getBarData(bar);
      if (type === Trend.Up) {
        ctx.strokeRect(x, y, width, height);
        this.drawLine(ctx, bar.x, -bar.highY, bar.x, y);
        this.drawLine(ctx, bar.x, -bar.lowY, bar.x, y + height);
      }
    }
    // ctx.fill();
    ctx.stroke();
    ctx.fillStyle = config[Trend.Down].fillStyle;
    ctx.strokeStyle = config[Trend.Down].strokeStyle;
    ctx.beginPath();
    for (const bar of bars) { 
      const type = bar.type;
      const { x, y, width, height } = this.getBarData(bar);
      if (type === Trend.Down) {
        ctx.strokeRect(x, y, width, height);
        this.drawLine(ctx, bar.x, -bar.lowY, bar.x, -bar.closeY);
        this.drawLine(ctx, bar.x, -bar.highY, bar.x, y);
      }
    }
    // ctx.fill();
    ctx.stroke();
  }
  private getBarData(bar: CandlestickBar): Bound {
    const { x, y, width, height } = bar;
    return {
      x: x - width / 3,
      y: -(y + height),
      width: width / 3 * 2,
      height
    };
  }
}