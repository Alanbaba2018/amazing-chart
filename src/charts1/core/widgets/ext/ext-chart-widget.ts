import BaseChartWidget from '../base-chart-widget'
import ExtChartRenderer from '../../renderers/ext/ext-chart-renderer'

export default class ExtChartWidget extends BaseChartWidget {
  public config = { zIndex: 100 }

  public renderer: ExtChartRenderer = new ExtChartRenderer()

  public weight: number = 0.3

  public render() {}
}
