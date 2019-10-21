import Range from './range';
import { generateScale } from '../util/helper';

export default class Axis {
  public tickNumber: number = 10;
  public domainRange!: Range;
  public coordRange!: Range;
  public unitWidth: number = 0;
  constructor(domain: number[], coordRange: number[], tickNumber: number = 10, linear: boolean = true) {
    this.tickNumber = tickNumber;
    this.domainRange = new Range(domain[0], domain[1]);
    this.coordRange = new Range(coordRange[0], coordRange[1]);
    if (linear) {
      this.buildAxis();
    }
  }
  public getAxisData() {
    const min = this.domainRange.getMinValue();
    const max = this.domainRange.getMaxValue();
    let start = this.coordRange.getMinValue();
    const coordInterval = this.coordRange.getInterval();
    const step = coordInterval / this.tickNumber;
    const domainStep = (max - min) / this.tickNumber;
    const ticks = [];
    for (let i = 0; i <= this.tickNumber; i++) {
      const p = start + i * step;
      ticks.push({ p, v: min + i * domainStep});
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
    // this.buildAxis();
  }
  private buildAxis() {
    const { min, max, tickNumber } = generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), this.tickNumber);
    this.tickNumber = tickNumber;
    this.domainRange.setMinValue(min)
      .setMaxValue(max);
    this.unitWidth = this.coordRange.getInterval() / this.tickNumber;
  }
}