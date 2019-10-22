import { TimeScaleType, TimeScaleStep } from '../typeof/type';
import Axis from './axis';

const TimeUnit = {
  Day: {
    value: 24 * 60 * 60 * 1000,
    width: 200
  },
  Hour: {
    value: 60 * 60 * 1000,
    width: 15
  },
  Minute: {
    value: 60 * 1000,
    width: 5
  },
  Second: {
    value: 1000,
    width: 2,
  }
}

export default class TimeAxis extends Axis {
  public timeScaleType: TimeScaleType = TimeScaleType.Day;
  constructor(domainRange: number[], coorRange: number[], originNumber: number) {
    super(domainRange, coorRange, false);
    this.setTimeScale(originNumber);
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
    return TimeUnit[this.timeScaleType].value;
  }
  public setTimeScaleType(type: TimeScaleType) {
    this.timeScaleType = type;
    return this;
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
    const days = Math.ceil(timeInterval / TimeUnit.Day.value) + 1;
    if (originNumber <= days) {
      this.timeScaleType = TimeScaleType.Day;
      this.unitWidth = TimeUnit.Day.width;
      this.resetTimeDomainRange();
      return;
    }
    const hours = Math.ceil(timeInterval / TimeUnit.Hour.value) + 1;
    if (originNumber <= hours) {
      this.timeScaleType = TimeScaleType.Hour;
      this.unitWidth = TimeUnit.Hour.width;
      this.resetTimeDomainRange();
      return;
    }
    const minutes = Math.ceil(timeInterval / TimeUnit.Minute.value) + 1;
    if (originNumber <= minutes) {
      this.timeScaleType = TimeScaleType.Minute;
      this.unitWidth = TimeUnit.Minute.width;
      this.resetTimeDomainRange();
      return;
    }
    const seconds = Math.ceil(timeInterval / TimeUnit.Second.value) + 1;
    if (originNumber <= seconds) {
      this.timeScaleType = TimeScaleType.Second;
      this.unitWidth = TimeUnit.Second.width;
      this.resetTimeDomainRange();
      return;
    }
  }
  private resetTimeDomainRange() {
    const coordInterval = this.coordRange.getInterval();
    const unitCount = Math.round(coordInterval / this.unitWidth);
    this.domainRange.setMinValue(this.domainRange.getMaxValue() - unitCount * this.getUnitTimeValue());
  }
}