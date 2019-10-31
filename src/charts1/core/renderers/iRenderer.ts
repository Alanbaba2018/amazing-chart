import { CommonObject } from '../../typeof/type'

export default abstract class IRenderer {
  public abstract draw(ctx: CanvasRenderingContext2D, data: any, config?: CommonObject): void
}
