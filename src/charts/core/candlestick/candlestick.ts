import BasePanel from '../basePanel';
import { PanelOptions, CandlestickItem } from '../../typeof/type';
import CandlestickWidget from '../widgets/candlestick-widget';

export default class Candlestick extends BasePanel {
  public config = {marginLeft: 0, marginRight: 60, marginBottom: 30, marginTop: 0};
  constructor(options: PanelOptions) {
    super(options);
    const container = this.options.container;
    if (container) {
      this.setAttrs({width: container.clientWidth, height: container.clientHeight});
    }
    const candlewWidget = new CandlestickWidget();
    this.addWidget(candlewWidget);
  }
  public getExtent(): number[] {
    const visibleData = this.getVisibleSeriesData();
    const values: number[] = visibleData.reduce((acc: number[], cur: CandlestickItem) => {
      acc.push(...[cur.high, cur.low]);
      return acc;
    }, []);
    return [Math.min(...values), Math.max(...values)];
  }
}