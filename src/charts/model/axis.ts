import Range from './range';
import { generateScale } from '../util/helper';

export default class Axis {
  public domainRange!: Range;
  public coordRange!: Range;
  public unitWidth: number = 50;
  constructor(domain: number[], coordRange: number[], tickNumber: number = 10, linear: boolean = true) {
    this.domainRange = new Range(domain[0], domain[1]);
    this.coordRange = new Range(coordRange[0], coordRange[1]);
    if (linear) {
      this.buildAxis();
    }
  }
  public getAxisData() {
    const min = this.domainRange.getMinValue();
    const coordMax = this.coordRange.getMaxValue();
    const unitValue = this.domainRange.getInterval() / this.coordRange.getInterval() * this.unitWidth;
    const ticks = [];
    for (let start = this.coordRange.getMinValue(), i = 0; start <= coordMax; start += this.unitWidth, i++) {
      ticks.push({ p: start, v: min + i * unitValue});
    }
    return ticks;
  }
  public getCoordOfValue(v: number) {
    const domainInterval = this.domainRange.getInterval();
    const rangeInterval = this.coordRange.getInterval();
    return this.coordRange.getMinValue() + (v - this.domainRange.getMinValue()) / domainInterval * rangeInterval;
  }
  public getValueOfCoord(coord: number) {
    const domainInterval = this.domainRange.getInterval();
    const rangeInterval = this.coordRange.getInterval();
    return this.domainRange.getMinValue() + (coord - this.coordRange.getMinValue()) / rangeInterval * domainInterval;
  }
  public scaleAroundCenter(coeff: number) {
    this.domainRange.scaleAroundCenter(coeff);
    this.unitWidth /= coeff;
  }
  private buildAxis() {
    const tickCounts = Math.floor(this.coordRange.getInterval() / this.unitWidth);
    const { min, max } = generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), tickCounts);
    this.domainRange.setMinValue(min)
      .setMaxValue(max);
  }
}