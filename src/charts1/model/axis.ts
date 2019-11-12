import Range from './range'
import { TickData } from '../typeof/type'

export default class Axis {
  public domainRange!: Range

  public coordRange!: Range

  public unitWidth: number = 60

  private _displayUnitWidth: number = 0

  // current scale ratio, so that we can calculate y-Extent updated map to axis
  protected _scaleCoeff: number = 1.5

  protected _maxScaleCoeff: number = 6

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
    if (this._displayUnitWidth >= 140) {
      this._displayUnitWidth /= Math.log(10)
    } else if (this._displayUnitWidth <= 25) {
      this._displayUnitWidth *= Math.log(100)
    } else if (this._displayUnitWidth <= 45) {
      this._displayUnitWidth *= Math.log(10)
    }
    const unitValue = (this.domainRange.getInterval() / this.coordRange.getInterval()) * this._displayUnitWidth
    const halfRestWidth = this.coordRange.getInterval() / 2 - this._displayUnitWidth / 2
    // deal edge condition
    const tickCounts = Math.ceil(halfRestWidth / this._displayUnitWidth + 1e-5) * 2
    const disCoord: number = halfRestWidth % this._displayUnitWidth
    const startCoord = this.coordRange.getMinValue() + disCoord
    const startValue = this.domainRange.getMinValue() + (disCoord / this._displayUnitWidth) * unitValue
    const ticks: TickData[] = []
    for (let i = 0; i < tickCounts; i++) {
      ticks.push({ p: startCoord + i * this._displayUnitWidth, v: startValue + i * unitValue })
    }
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
