import { isNumber } from '../util/type-check';

export default class Range {
  private _min: number = 0;
  private _max: number = 0;
  constructor(min: number, max: number) {
    this._min = min;
    this._max = max;
  }
  public isInvalid() {
    return !isNumber(this._min) || !isNumber(this._max);
  }
  public getMinValue() {
    return this._min;
  }
  public setMinValue(value: number) {
    this._min = value;
    return this;
  }
  public getMaxValue() {
    return this._max;
  }
  public setMaxValue(value: number) {
    this._max = value;
    return this;
  }
  public getInterval() {
    return this._max - this._min;
  }
  public merge(range: Range) {
    if (range.isInvalid) {
      return this;
    }
    return new Range(Math.min(this._min, range.getMinValue()), Math.max(this._max, range.getMaxValue()));
  }
  public scaleAroundCenter(coeff: number) {
    if (!isNumber(coeff)) return;
    const center = (this._min + this._max) * 0.5;
    const halfInterval = (this._max - this._min) * 0.5;
    const delta = halfInterval * coeff;
    this._min = center - delta;
    this._max = center + delta;
  }
  public scaleAroundPoint(p: number, coeff: number) {
    if (!isNumber(p) || !isNumber(coeff) || !this.contain(p)) return;
    const leftInterval = p - this.getMinValue();
    const rightInterval = this.getMaxValue() - p;
    this._min = p - leftInterval * coeff;
    this._max = p + rightInterval * coeff;
  }
  public shift(step: number) {
    if (!isNumber(step)) return;
    console.log(`max: ${this._max}, step: ${step}`);
    this._min += step;
    this._max += step;
  }
  public contains(range: Range, strict = true) {
    return strict ? 
      this._min < range.getMinValue() && this._max > range.getMaxValue()
      : this._min <= range.getMinValue() && this._max >= range.getMaxValue();
  }
  public contain(v: number): boolean {
    return v >= this.getMinValue() && v <= this.getMaxValue();
  }
}