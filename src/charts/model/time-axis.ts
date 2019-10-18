import Range from './range';
import { TimeScaleType } from '../typeof/type';

const Day = 24 * 60 * 60 * 1000;
const Hour = 60 * 60 * 1000;
const Minute = 60 * 1000;

export default class TimeAxis {
  public timeDomain!: Range;
  public coordRange!: Range;
  public timeScaleType: TimeScaleType = TimeScaleType.Day;
  public unitTimeWidth: number = 0;
  constructor(timeDomain: number[], coorRange: number[], originNumber: number) {
    this.timeDomain = new Range(timeDomain[0], timeDomain[1]);
    this.coordRange = new Range(coorRange[0], coorRange[1]);
    this.setTimeScale(originNumber);
  }
  public getCoordOfValue(v: number) {
    const domainInterval = this.timeDomain.getInterval();
    const rangeInterval = this.coordRange.getInterval();
    return this.coordRange.getMinValue() + (v - this.timeDomain.getMinValue()) / domainInterval * rangeInterval;
  }
  public getValueOfCoord(coord: number) {
    const domainInterval = this.timeDomain.getInterval();
    const rangeInterval = this.coordRange.getInterval();
    return this.timeDomain.getMinValue() + (coord - this.coordRange.getMinValue()) / rangeInterval * domainInterval;
  }
  private setTimeScale(originNumber: number) {
    const timeInterval = this.timeDomain.getInterval();
    const coordInterval = this.coordRange.getInterval();
    const days = Math.ceil(timeInterval / Day);
    if (originNumber <= days) {
      this.timeScaleType = TimeScaleType.Day;
      this.unitTimeWidth = coordInterval / days;
      return;
    }
    const hours = Math.ceil(timeInterval / Hour);
    if (originNumber <= hours) {
      this.timeScaleType = TimeScaleType.Hour;
      this.unitTimeWidth = coordInterval / hours;
      return;
    }
    const minutes = Math.ceil(timeInterval / Minute);
    if (originNumber <= minutes) {
      this.timeScaleType = TimeScaleType.Minute;
      this.unitTimeWidth = coordInterval / minutes;
      return;
    }
  }
}