import Canvas from './canvas';

export default abstract class IRenderer extends Canvas{
  public abstract draw(ctx: CanvasRenderingContext2D, data: any): void;
}