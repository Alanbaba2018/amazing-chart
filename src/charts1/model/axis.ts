import Range from './range'
import { TickData } from '../typeof/type'
import { generateScale } from '../util/helper'

export default class Axis {
  public domainRange!: Range

  public coordRange!: Range

  public unitWidth: number = 30

  private _displayUnitWidth: number = 0

  // current scale ratio, so that we can calculate y-Extent updated map to axis
  protected _scaleCoeff: number = 2

  protected _maxScaleCoeff: number = 4

  protected _minScaleCoeff: number = 1

  constructor(domain: number[], coordRange: number[], linear: boolean = true) {
    this.domainRange = new Range(domain[0], domain[1])
    this.coordRange = new Range(coordRange[0], coordRange[1])
    if (linear) {
      this.domainRange.scaleAroundCenter(this._scaleCoeff)
    }
  }

  public setCurrentScaleCoeff(coeff: number) {
    this._scaleCoeff = coeff
    this.domainRange.scaleAroundCenter(this._scaleCoeff)
  }

  public getCurrentScaleCoeff(): number {
    return this._scaleCoeff
  }

  public setUnitWidth(width: number) {
    this.unitWidth = width
  }

  // from middle to both sides draw
  public getAxisData(): TickData[] {
    this._displayUnitWidth = this.unitWidth
    // hardcode to adjust display neared ticks interval
    if (this._displayUnitWidth >= 40) {
      this._displayUnitWidth /= 1.5
    } else if (this._displayUnitWidth <= 15) {
      this._displayUnitWidth *= 2.8
    } else if (this._displayUnitWidth <= 25) {
      this._displayUnitWidth *= 1.5
    }
    const halfRestWidth = this.coordRange.getInterval() / 2 - this._displayUnitWidth / 2
    // deal edge condition
    const tickCounts = Math.ceil(halfRestWidth / this._displayUnitWidth + 1e-5) * 2
    const range = this.domainRange
    const { min, step } = generateScale(range.getMaxValue(), range.getMinValue(), tickCounts)
    const ticks: TickData[] = [...Array(tickCounts)].map((_, index) => {
      const value = min + index * step
      return {
        p: this.getCoordOfValue(value),
        v: value,
      }
    })
    return ticks
  }

  public getUnitTimeValue(): number {
    return (this.domainRange.getInterval() / this.coordRange.getInterval()) * this.unitWidth
  }

  public getScaleCoeff(): number {
    return this._scaleCoeff
  }

  public getCoordOfValue(v: number) {
    const domainInterval = this.domainRange.getInterval()
    const rangeInterval = this.coordRange.getInterval()
    return this.coordRange.getMinValue() + ((v - this.domainRange.getMinValue()) / domainInterval) * rangeInterval
  }

  public getValueOfCoord(coord: number) {
    const domainInterval = this.domainRange.getInterval()
    const rangeInterval = this.coordRange.getInterval()
    return this.domainRange.getMinValue() + ((coord - this.coordRange.getMinValue()) / rangeInterval) * domainInterval
  }

  public scaleAroundCenter(coeff: number) {
    if (this._scaleCoeff * coeff > this._maxScaleCoeff || this._scaleCoeff * coeff < this._minScaleCoeff) return
    this.unitWidth /= coeff
    this._scaleCoeff *= coeff
    this.domainRange.scaleAroundCenter(coeff)
  }

  public scaleAboveBottom(coeff: number) {
    if (this._scaleCoeff * coeff > this._maxScaleCoeff || this._scaleCoeff * coeff < this._minScaleCoeff) return
    this.unitWidth /= coeff
    this._scaleCoeff *= coeff
    this.domainRange.scaleAboveBottom(coeff)
  }
}
