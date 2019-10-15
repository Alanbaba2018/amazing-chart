import IWidget from './iWidget';
import PriceAxisRenderer from '../renderers/price-axis-renderer';

export default class PriceAxisWidget extends IWidget {
  public renderer = new PriceAxisRenderer();
  public render() {

  }
}