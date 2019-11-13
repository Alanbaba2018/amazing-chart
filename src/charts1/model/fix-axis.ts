import Axis from './axis'

export default class FixAxis extends Axis {
  // current scale ratio, so that we can calculate y-Extent updated map to axis
  protected _scaleCoeff: number = 1

  protected _maxScaleCoeff: number = 4

  protected _minScaleCoeff: number = 1

  constructor(domain: number[], coordRange: number[]) {
    super(domain, coordRange, false)
  }

  public scaleAroundCenter(coeff: number) {
    if (this._scaleCoeff * coeff > this._maxScaleCoeff || this._scaleCoeff * coeff < this._minScaleCoeff) return
    this.unitWidth /= coeff
    this._scaleCoeff *= coeff
    this.domainRange.scaleAboveBottom(coeff)
  }
}
