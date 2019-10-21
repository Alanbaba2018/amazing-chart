import { TimeScaleType, TimeScaleStep } from '../typeof/type';
import Axis from './axis';

const TimeUnitValue = {
  Day: 24 * 60 * 60 * 1000,
  Hour: 60 * 60 * 1000,
  Minute: 60 * 1000,
  Second: 1000
};

export default class TimeAxis extends Axis {
  public timeScaleType: TimeScaleType = TimeScaleType.Day;
  constructor(domainRange: number[], coorRange: number[], originNumber: number) {
    super(domainRange, coorRange, originNumber, false);
    this.setTimeScale(originNumber);
    this.unitWidth = this.coordRange.getInterval() / this.tickNumber;
  }
  public getCoordOfValue(v: number) {
    return this.coordRange.getMinValue() + (v - this.domainRange.getMinValue()) / this.getUnitTimeValue() * this.unitWidth;
  }
  // 时间刻度前后半格共同组成一个整点
  public getValueOfCoord(coord: number) {
    const interval = coord - this.coordRange.getMinValue();
    return this.domainRange.getMinValue() + Math.round(interval / this.unitWidth) * this.getUnitTimeValue();
  }
  public getUnitTimeValue(): number {
    return TimeUnitValue[this.timeScaleType];
  }
  public getAxisData() {
    const min = this.domainRange.getMinValue();
    const start = this.coordRange.getMinValue();
    const coordInterval = this.coordRange.getInterval();
    const steps = coordInterval / this.unitWidth;
    const unitTimeValue = this.getUnitTimeValue();
    const ticks = [];
    for (let i = 0; i <= steps; i++) {
      const p = start + i * this.unitWidth;
      const v = min + i * unitTimeValue;
      if (this.isTimeInteger(v)) {
        ticks.push({ p, v });
      }
    }
    return ticks;
  }
  private isTimeInteger(v: number): boolean {
    const integerTime = TimeScaleStep[this.timeScaleType];
    const d = new Date(v);
    const timeInfo = {
      [TimeScaleType.Day]: d.getDate(),
      [TimeScaleType.Hour]: d.getHours(),
      [TimeScaleType.Minute]: d.getMinutes(),
      [TimeScaleType.Second]: d.getSeconds()
    };
    return timeInfo[this.timeScaleType] % integerTime === 0;
  }
  private setTimeScale(originNumber: number) {
    const timeInterval = this.domainRange.getInterval();
    const days = Math.ceil(timeInterval / TimeUnitValue.Day) + 1;
    if (originNumber <= days) {
      this.timeScaleType = TimeScaleType.Day;
      this.tickNumber = days;
      return;
    }
    const hours = Math.ceil(timeInterval / TimeUnitValue.Hour) + 1;
    if (originNumber <= hours) {
      this.timeScaleType = TimeScaleType.Hour;
      this.tickNumber = hours;
      return;
    }
    const minutes = Math.ceil(timeInterval / TimeUnitValue.Minute) + 1;
    if (originNumber <= minutes) {
      this.timeScaleType = TimeScaleType.Minute;
      this.tickNumber = minutes;
      return;
    }
  }
}