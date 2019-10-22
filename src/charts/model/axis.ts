import Range from './range';
import { generateScale } from '../util/helper';

export default class Axis {
  public domainRange!: Range;
  public coordRange!: Range;
  public unitWidth: number = 60;
  constructor(domain: number[], coordRange: number[], linear: boolean = true) {
    this.domainRange = new Range(domain[0], domain[1]);
    this.coordRange = new Range(coordRange[0], coordRange[1]);
    if (linear) {
      this.buildAxis();
    }
  }
  // 从中间向两边绘制
  public getAxisData() {
    let unitWidth = this.unitWidth;
    // hardcode to adjust display neared ticks interval
    if (unitWidth >= 140) {
      unitWidth /= Math.log(10);
    } else if (unitWidth <= 25) {
      unitWidth *= Math.log(100);
    } else if (unitWidth <= 45) {
      unitWidth *= Math.log(10);
    }
    const unitValue = this.domainRange.getInterval() / this.coordRange.getInterval() * unitWidth;
    const halfRestWidth = this.coordRange.getInterval() / 2  - unitWidth / 2;
    const tickCounts = Math.floor(halfRestWidth / unitWidth) * 2 + 1;
    const startCoord = this.coordRange.getMinValue() + halfRestWidth % unitWidth;
    const startValue = this.domainRange.getMinValue() + halfRestWidth % unitWidth / unitWidth * unitValue;
    const ticks = [];
    for (let i = 0; i <= tickCounts; i++) {
      ticks.push({ p: startCoord + i * unitWidth, v: startValue + i * unitValue});
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
    if ((this.unitWidth <= 20 && coeff > 1) || (this.unitWidth > 160 && coeff < 1)) return;
    this.unitWidth /= coeff;
    this.domainRange.scaleAroundCenter(coeff);
  }
  public buildAxis() {
    const tickCounts = Math.floor(this.coordRange.getInterval() / this.unitWidth);
    const { min, max } = generateScale(this.domainRange.getMaxValue(), this.domainRange.getMinValue(), tickCounts);
    this.domainRange.setMinValue(min)
      .setMaxValue(max);
  }
}