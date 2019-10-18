import Range from './range';
import { generateScale } from '../util/helper';

export default class Axis {
  public tickNumber: number = 10;
  public domainRange!: Range;
  public coordRange!: Range;
  public cellWidth: number = 0;
  private isFixed: boolean = false;
  constructor(domain: number[], coordRange: number[], tickNumber: number = 10, isFixed: boolean = false) {
    this.tickNumber = tickNumber;
    this.domainRange = new Range(domain[0], domain[1]);
    this.coordRange = new Range(coordRange[0], coordRange[1]);
    this.isFixed = isFixed;
    if (!this.isFixed) {
      this.buildAxis();
    }
    this.cellWidth = this.coordRange.getInterval() / this.tickNumber;
  }
  public getAxisData() {
    let min = this.domainRange.getMinValue(),
      max = this.domainRange.getMaxValue();
    if (!this.isFixed) {
      const scaleInfo = generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), this.tickNumber);
      min = scaleInfo.min;
      max = scaleInfo.max;
      this.tickNumber = scaleInfo.tickNumber;
      this.domainRange.setMinValue(min)
        .setMaxValue(max);
    }
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
  private buildAxis() {
    const { min, max, tickNumber } = generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), this.tickNumber);
    this.tickNumber = tickNumber;
    this.domainRange.setMinValue(min)
      .setMaxValue(max);
  }
}