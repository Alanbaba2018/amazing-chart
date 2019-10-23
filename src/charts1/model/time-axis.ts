import { TimeScaleType, TimeScaleStep, TickData } from '../typeof/type'
import Axis from './axis'

const TimeUnit = {
  [TimeScaleType.Day]: {
    value: 24 * 60 * 60 * 1000,
    width: 30,
  },
  [TimeScaleType.Hour]: {
    value: 60 * 60 * 1000,
    width: 10,
  },
  [TimeScaleType.Minute]: {
    value: 60 * 1000,
    width: 5,
  },
  [TimeScaleType.Second]: {
    value: 1000,
    width: 2,
  },
}
export default class TimeAxis extends Axis {
  public timeScaleType: TimeScaleType = TimeScaleType.Day;

  protected _scaleCoeff: number = 1;

  protected _maxScaleCoeff: number = 10;

  protected _minScaleCoeff: number = 0.3;

  constructor (domainRange: number[], coorRange: number[], originNumber: number) {
    super(domainRange, coorRange, false)
    this.setTimeScale(originNumber)
  }

  public getCoordOfValue (v: number) {
    const minCoord = this.coordRange.getMinValue()
    const minTimeValue = this.domainRange.getMinValue()
    return minCoord + (v - minTimeValue) / this.getUnitTimeValue() * this.unitWidth
  }

  /*
   1、坐标轴起点不一定是整点，需计算第一个刻度线(整点)距起点的时间差以及坐标差;
   2、通过四舍五入取刻度线前后半格都属于该整点
  */
  public getValueOfCoord (coord: number) {
    const unitTimeValue = this.getUnitTimeValue()
    const minTimeValue = this.domainRange.getMinValue()
    const disTime = unitTimeValue - minTimeValue % unitTimeValue
    const disCoord = disTime / unitTimeValue * this.unitWidth
    const interval = coord - this.coordRange.getMinValue() - disCoord
    return minTimeValue + disTime + Math.round(interval / this.unitWidth) * unitTimeValue
  }

  public getUnitTimeValue (): number {
    return TimeUnit[this.timeScaleType].value
  }

  public setTimeScaleType (type: TimeScaleType) {
    this.timeScaleType = type
    return this
  }

  public getAxisData (): TickData[] {
    let minTimeValue = this.domainRange.getMinValue()
    let start = this.coordRange.getMinValue()
    const coordInterval = this.coordRange.getInterval()
    const steps = coordInterval / this.unitWidth
    const unitTimeValue = this.getUnitTimeValue()
    const ticks:TickData[] = []
    for (let i = 0; i <= steps; i++) {
      // 第一个刻度
      if (i === 0) {
        // 起点距离第一个刻度线相差的时间
        const disTime = unitTimeValue - minTimeValue % unitTimeValue
        const disCoord = disTime / unitTimeValue * this.unitWidth
        start += disCoord
        minTimeValue += disTime
      }
      const value = minTimeValue + i * unitTimeValue
      if (this.isTimeInteger(value)) {
        ticks.push({ p: start + i * this.unitWidth, v: value })
      }
    }
    return ticks
  }

  public scaleAroundTimestamp (timestamp: number, coeff: number) {
    if (this._scaleCoeff * coeff > this._maxScaleCoeff
      || this._scaleCoeff * coeff < this._minScaleCoeff) return
    this.unitWidth /= coeff
    this._scaleCoeff *= coeff
    this.domainRange.scaleAroundPoint(timestamp, coeff)
  }

  private isTimeInteger (v: number): boolean {
    const integerTime = TimeScaleStep[this.timeScaleType]
    const d = new Date(v)
    const timeInfo = {
      [TimeScaleType.Day]: d.getDate(),
      [TimeScaleType.Hour]: d.getHours(),
      [TimeScaleType.Minute]: d.getMinutes(),
      [TimeScaleType.Second]: d.getSeconds(),
    }
    return timeInfo[this.timeScaleType] % integerTime === 0
  }

  private setTimeScale (originNumber: number) {
    const timeInterval = this.domainRange.getInterval()
    const days = Math.ceil(timeInterval / TimeUnit.Day.value) + 1
    if (originNumber <= days) {
      this.timeScaleType = TimeScaleType.Day
      this.resetTimeDomainRange()
      return
    }
    const hours = Math.ceil(timeInterval / TimeUnit.Hour.value) + 1
    if (originNumber <= hours) {
      this.timeScaleType = TimeScaleType.Hour
      this.resetTimeDomainRange()
      return
    }
    const minutes = Math.ceil(timeInterval / TimeUnit.Minute.value) + 1
    if (originNumber <= minutes) {
      this.timeScaleType = TimeScaleType.Minute
      this.resetTimeDomainRange()
      return
    }
    const seconds = Math.ceil(timeInterval / TimeUnit.Second.value) + 1
    if (originNumber <= seconds) {
      this.timeScaleType = TimeScaleType.Second
      this.resetTimeDomainRange()
    }
  }

  private resetTimeDomainRange () {
    this.unitWidth = TimeUnit[this.timeScaleType].width
    const coordInterval = this.coordRange.getInterval()
    const unitCount = coordInterval / this.unitWidth
    const maxTimeValue = this.domainRange.getMaxValue()
    this.domainRange.setMinValue(maxTimeValue - unitCount * this.getUnitTimeValue())
  }
}
