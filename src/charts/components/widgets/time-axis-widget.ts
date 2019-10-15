import IWidget from './iWidget';
import TimeAxisRenderer from '../renderers/time-axis-renderer';

export default class TimeAxisWidget extends IWidget {
  public renderer = new TimeAxisRenderer();
  public render() {

  }
}