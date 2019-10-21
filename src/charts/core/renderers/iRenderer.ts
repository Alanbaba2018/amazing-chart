import Canvas from '../canvas';
import { CommonObject } from '../../typeof/type';

export default abstract class IRenderer extends Canvas {
  public abstract draw(ctx: CanvasRenderingContext2D, data: any, config?: CommonObject): void;
}