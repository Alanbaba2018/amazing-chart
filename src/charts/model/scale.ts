import Range from './range';
import { generateScale } from '../util/helper';

export default class Scale {
  public domainRange!: Range;
  public coordRange!: Range;
  public tickNumber: number = 10;
  constructor(range: number[], coord: number[], tickNumber?: number) {
    this.domainRange = new Range(range[0], range[1]);
    this.coordRange = new Range(coord[0], coord[1]);
    this.tickNumber = tickNumber || 10;
  }
  getCoordOfValue(v: number) {
    const domainInterval = this.domainRange.getInterval();
    const rangeInterval = this.coordRange.getInterval();
    return this.coordRange.getMinValue() + (v - this.domainRange.getMinValue()) / domainInterval * rangeInterval;
  }
  getValueOfCoord(coord: number) {
    const domainInterval = this.domainRange.getInterval();
    const rangeInterval = this.coordRange.getInterval();
    return this.domainRange.getMinValue() + (coord - this.coordRange.getMinValue()) / rangeInterval * domainInterval;
  }
  buildTickData() {
    return generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), this.tickNumber);
  }
}