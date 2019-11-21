import { TimeScaleType, TimeScale, TickData } from '../typeof/type'
import { TimeScales, TimeInterval } from '../typeof/constant'
import { getDaysBetween, getHoursBetween, getMinutesBetween } from '../util/helper'
import Axis from './axis'

export default class TimeAxis extends Axis {
  public unitWidth: number = 8

  protected timeUnitValue: number = 0

  protected _scaleCoeff: number = 1

  protected _maxScaleCoeff: number = 9

  protected _minScaleCoeff: number = 0.2

  private _currentTimeScale: TimeScale // current scale

  private _timeScales: TimeScale[] = [] // time scales

  private _maxTimeValue: number

  constructor(domainRange: number[], coorRange: number[], originNumber: number) {
    super(domainRange, coorRange, false)
    this.ananlysisIsDaysInterval(originNumber)
    this.resetTimeDomainRange()
    this._maxTimeValue = this.domainRange.getMaxValue()
  }

  public getCoordOfValue(v: number) {
    const minCoord = this.coordRange.getMinValue()
    const minTimeValue = this.domainRange.getMinValue()
    return minCoord + ((v - minTimeValue) / this.getUnitTimeValue()) * this.unitWidth
  }

  /*
   1、坐标轴起点不一定是整点，需计算第一个刻度线(整点)距起点的时间差以及坐标差;
   2、通过四舍五入取刻度线前后半格都属于该整点
   3、0点的时间戳和整天取模返回时区差
  */
  public getValueOfCoord(coord: number) {
    const unitTimeValue = this.getUnitTimeValue()
    const minTimeValue = this.domainRange.getMinValue()
    const disTime = (this._maxTimeValue - minTimeValue) % this.timeUnitValue
    const disCoord = (disTime / unitTimeValue) * this.unitWidth
    const interval = coord - this.coordRange.getMinValue() - disCoord
    return minTimeValue + disTime + Math.round(interval / this.unitWidth) * unitTimeValue
  }

  public getUnitTimeValue(): number {
    return this.timeUnitValue
  }

  public getCurrentTimeScale(): TimeScale {
    return this._currentTimeScale
  }

  public setCurrentTimeScale(timeScale: TimeScale) {
    this._currentTimeScale = timeScale
    return this
  }

  public getAxisData(): TickData[] {
    let minTimeValue = this.domainRange.getMinValue()
    let start = this.coordRange.getMinValue()
    const coordInterval = this.coordRange.getInterval()
    const steps = coordInterval / this.unitWidth
    const unitTimeValue = this.getUnitTimeValue()
    const ticks: TickData[] = []
    for (let i = 0; i <= steps; i++) {
      // 第一个刻度
      if (i === 0) {
        // 起点距离第一个刻度线相差的时间
        const disTime = (this._maxTimeValue - minTimeValue) % this.timeUnitValue
        const disCoord = (disTime / unitTimeValue) * this.unitWidth
        start += disCoord
        minTimeValue += disTime
      }
      const value = minTimeValue + i * unitTimeValue
      if (this.isShowTicks(value)) {
        ticks.push({ p: start + i * this.unitWidth, v: value })
      }
    }
    return ticks
  }

  public scaleAroundTimestamp(timestamp: number, coeff: number) {
    if (
      this.unitWidth / coeff < 2 ||
      this._scaleCoeff * coeff > this._maxScaleCoeff ||
      this._scaleCoeff * coeff < this._minScaleCoeff
    )
      return
    this.unitWidth /= coeff
    this._scaleCoeff *= coeff
    this.domainRange.scaleAroundPoint(timestamp, coeff)
    this.updateTimeScale()
  }

  public setTimeScales(timeScales: TimeScale[]) {
    this._timeScales = timeScales
    return this
  }

  private updateTimeScale() {
    let scaleIndex = Math.floor(this._scaleCoeff / 1.5)
    scaleIndex = this._timeScales.length - scaleIndex - 1
    if (scaleIndex >= 0 && scaleIndex < this._timeScales.length) {
      this.setCurrentTimeScale(this._timeScales[scaleIndex])
    }
  }

  private isShowTicks(v: number): boolean {
    const d = new Date(v)
    const { type: timeScaleType, number: integerTime } = this._currentTimeScale
    const timeInfo = {
      [TimeScaleType.Month]: d.getMonth(),
      [TimeScaleType.Day]: d.getDate(),
      [TimeScaleType.Hour]: d.getHours(),
      [TimeScaleType.Minute]: d.getMinutes(),
    }
    // week
    if (timeScaleType === TimeScaleType.Day) {
      const isIntegerDay = timeInfo[TimeScaleType.Hour] === 0 && timeInfo[TimeScaleType.Minute] === 0
      return integerTime === 7 ? d.getDay() === 0 && isIntegerDay : isIntegerDay
    }
    // month
    if (timeScaleType === TimeScaleType.Month) {
      return (
        timeInfo[TimeScaleType.Month] % integerTime === 0 &&
        timeInfo[TimeScaleType.Day] * TimeInterval.Day <= this.timeUnitValue
      )
    }
    // hour
    if (timeScaleType === TimeScaleType.Hour) {
      return timeInfo[timeScaleType] % integerTime === 0 && timeInfo[TimeScaleType.Minute] === 0
    }
    return timeInfo[timeScaleType] % integerTime === 0
  }

  private ananlysisIsDaysInterval(originNumber: number) {
    const days = getDaysBetween(this.domainRange.getMinValue(), this.domainRange.getMaxValue())
    const weeks = Math.ceil(days / 7)
    const threeDays = Math.ceil(days / 3)
    if (originNumber <= weeks) {
      this.setTimeScales(TimeScales.slice(0, 3))
      this.timeUnitValue = TimeInterval.Day * 7
    } else if (originNumber <= threeDays) {
      this.setTimeScales(TimeScales.slice(1, 3))
      this.timeUnitValue = TimeInterval.Day * 3
    } else if (originNumber <= days) {
      this.setTimeScales(TimeScales.slice(2, 4))
      this.timeUnitValue = TimeInterval.Day
    } else {
      this.analysisIsHoursInterval(originNumber)
    }
    this.setCurrentTimeScale(this._timeScales[this._timeScales.length - 1])
  }

  private analysisIsHoursInterval(originNumber: number) {
    const hours = getHoursBetween(this.domainRange.getMinValue(), this.domainRange.getMaxValue())
    const twelveHours = Math.ceil(hours / 12)
    const sixHours = Math.ceil(hours / 6)
    const fourHours = Math.ceil(hours / 4)
    const twoHours = Math.ceil(hours / 2)
    if (originNumber <= twelveHours) {
      this.setTimeScales(TimeScales.slice(2, 4))
      this.timeUnitValue = TimeInterval.Hour * 12
    } else if (originNumber <= sixHours) {
      this.setTimeScales(TimeScales.slice(3, 5))
      this.timeUnitValue = TimeInterval.Hour * 6
    } else if (originNumber <= fourHours) {
      this.setTimeScales(TimeScales.slice(3, 5))
      this.timeUnitValue = TimeInterval.Hour * 4
    } else if (originNumber <= twoHours) {
      this.setTimeScales(TimeScales.slice(3, 6))
      this.timeUnitValue = TimeInterval.Hour * 2
    } else if (originNumber <= hours) {
      this.setTimeScales(TimeScales.slice(4, 6))
      this.timeUnitValue = TimeInterval.Hour
    } else {
      this.analysisIsMinutesInterval(originNumber)
    }
  }

  private analysisIsMinutesInterval(originNumber: number) {
    const minutes = getMinutesBetween(this.domainRange.getMinValue(), this.domainRange.getMaxValue())
    const thirtyMinutes = Math.ceil(minutes / 30)
    const fifMinutes = Math.ceil(minutes / 15)
    const fiveMinutes = Math.ceil(minutes / 5)
    const threeMinutes = Math.ceil(minutes / 3)
    if (originNumber <= thirtyMinutes) {
      this.setTimeScales(TimeScales.slice(4, 6))
      this.timeUnitValue = TimeInterval.Minute * 30
    } else if (originNumber <= fifMinutes) {
      this.setTimeScales(TimeScales.slice(5, 7))
      this.timeUnitValue = TimeInterval.Minute * 15
    } else if (originNumber <= fiveMinutes) {
      this.setTimeScales(TimeScales.slice(5, 8))
      this.timeUnitValue = TimeInterval.Minute * 5
    } else if (originNumber <= threeMinutes) {
      this.setTimeScales(TimeScales.slice(5, 8))
      this.timeUnitValue = TimeInterval.Minute * 3
    } else if (originNumber <= minutes) {
      this.setTimeScales(TimeScales.slice(7))
      this.timeUnitValue = TimeInterval.Minute
    }
  }

  private resetTimeDomainRange() {
    const coordInterval = this.coordRange.getInterval()
    const unitCount = coordInterval / this.unitWidth
    const maxTimeValue = this.domainRange.getMaxValue()
    this.domainRange.setMinValue(maxTimeValue - unitCount * this.getUnitTimeValue())
  }
}
