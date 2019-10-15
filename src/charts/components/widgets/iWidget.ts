import EventHandle from '../eventHandle';
import IRenderer from '../renderers/iRenderer';

export default abstract class IWidget extends EventHandle{
  public abstract renderer: IRenderer;
  public abstract render(): void;
  public destroy() {};
}