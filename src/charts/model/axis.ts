import Scale from './scale';

export default class Axis {
  public origin!: number[];
  public direction!: string;
  public scale!: Scale;
  public tickNumber: number = 10;
  constructor(origin: number[], domain: number[], coordRange: number[], tickNumber: number = 10, direction: string = '') {
    this.origin = origin;
    this.direction = direction;
    this.tickNumber = tickNumber;
    this.scale = new Scale(domain, coordRange, this.tickNumber);
  }
  getAxisData() {
    const { min, max, tickNumber } = this.scale.buildTickData();
    let start = this.scale.coordRange.getMinValue();
    const coordInterval = this.scale.coordRange.getInterval();
    const step = coordInterval / tickNumber;
    const domainStep = (max - min) / tickNumber;
    const ticks = [];
    for (let i = 0; i <= tickNumber; i++) {
      const p = start + i * step;
      ticks.push({ p, v: (min + i * domainStep).toFixed(2)});
    }
    return ticks;
  }
}