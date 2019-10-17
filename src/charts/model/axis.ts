import Range from './range';
import { generateScale } from '../util/helper';

export default class Axis {
  public origin!: number[];
  public direction!: string;
  public tickNumber: number = 10;
  public domainRange!: Range;
  public coordRange!: Range;
  public ratio: number = 1;
  constructor(origin: number[], domain: number[], coordRange: number[], tickNumber: number = 10, direction: string = '') {
    this.origin = origin;
    this.direction = direction;
    this.tickNumber = tickNumber;
    this.domainRange = new Range(domain[0], domain[1]);
    this.coordRange = new Range(coordRange[0], coordRange[1]);
    this.ratio = this.coordRange.getInterval() / this.domainRange.getInterval();
  }
  public getAxisData() {
    const { min, max, tickNumber } = generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), this.tickNumber);
    let start = this.coordRange.getMinValue();
    const coordInterval = this.coordRange.getInterval();
    const step = coordInterval / tickNumber;
    const domainStep = (max - min) / tickNumber;
    const ticks = [];
    for (let i = 0; i <= tickNumber; i++) {
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
}