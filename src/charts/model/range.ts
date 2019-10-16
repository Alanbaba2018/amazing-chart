import { isNumber } from '../util/type-check';

export default class Range {
  private _min: number = 0;
  private _max: number = 0;
  constructor(min: number, max: number) {
    this._min = min;
    this._max = max;
  }
  isInvalid() {
    return !isNumber(this._min) || !isNumber(this._max);
  }
  getMinValue() {
    return this._min;
  }
  setMinValue(value: number) {
    this._min = value;
  }
  getMaxValue() {
    return this._max;
  }
  setMaxValue(value: number) {
    this._max = value;
  }
  getInterval() {
    return this._max - this._min;
  }
  merge(range: Range) {
    if (range.isInvalid) {
      return this;
    }
    return new Range(Math.min(this._min, range.getMinValue()), Math.max(this._max, range.getMaxValue()));
  }
  scaleAroundCenter(coeff: number) {
    if (!isNumber(coeff)) return;
    const center = (this._min + this._max) * 0.5;
    const halfInterval = (this._max - this._min) * 0.5;
    const delta = halfInterval * coeff;
    this._min = center - delta;
    this._max = center + delta;
  }
  shift(step: number) {
    if (!isNumber(step)) return;
    this._min += step;
    this._max += step;
  }
  contains(range: Range, strict = true) {
    return strict ? 
      this._min < range.getMinValue() && this._max > range.getMaxValue()
      : this._min <= range.getMinValue() && this._max >= range.getMaxValue();
  }
}