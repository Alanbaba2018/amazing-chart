import { pow, ln, ceil, abs } from './math';
import { Zero, DevicePixelRatio } from '../typeof/const';
import { Point, TimeScaleType, Bound } from '../typeof/type';

interface CanvasOptions {
  className?: string;
  style?: { [k: string]: string | number };
}
export function generateScale(originMax: number, originMin: number, originNumber: number) {
  const originStep = (originMax - originMin) / originNumber;
  const exp = parseInt(`${ln(originStep) / ln(10)}`);
  const temp = pow(10, exp) === originStep ? pow(10, exp) : pow(10, exp + 1);
  let tmpstep = Number((originStep / temp).toFixed(6));
  //选取规范步长
  if (tmpstep >= 0 && tmpstep <= 0.1) {
    tmpstep = 0.1;
  } else if (tmpstep >= 0.100001 && tmpstep <= 0.2) {
    tmpstep = 0.2;
  } else if (tmpstep >= 0.200001 && tmpstep <= 0.25) {
    tmpstep = 0.25;
  } else if (tmpstep >= 0.250001 && tmpstep <= 0.5) {
    tmpstep = 0.5;
  } else {
    tmpstep = 1;
  }
  tmpstep = tmpstep * temp;
  if (parseInt(`${originMin / tmpstep}`) !== (originMin / tmpstep)) {
    if (originMin < 0) {
      originMin = (-1) * ceil(abs(originMin / tmpstep)) * tmpstep;
    } else {
      originMin = parseInt(`${abs(originMin / tmpstep)}`) * tmpstep;
    }
  }
  if (parseInt(`${originMax / tmpstep}`) !== (originMax / tmpstep)) {
    originMax = parseInt(`${originMax / tmpstep + 1}`) * tmpstep;
  }
  let tmpnumber = (originMax - originMin) / tmpstep;
  if (tmpnumber < originNumber) {
    const extraNumber = originNumber - tmpnumber;
    tmpnumber = originNumber;
    if (extraNumber % 2 === 0) {
      originMax = originMax + tmpstep * parseInt(`${extraNumber / 2}`);
    } else {
      originMax = originMax + tmpstep * parseInt(`${extraNumber / 2 + 1}`);
    }
    originMin = originMin - tmpstep * parseInt(`${extraNumber / 2}`);
  }
  originNumber = tmpnumber;
  return {
    max: originMax,
    min: originMin,
  };
}
// -------------------Start canvas api--------------------
export function createCanvasElement(width: number, height: number, options: CanvasOptions = {
  style: {
    position: 'reletive', width: '100%', height: '100%'
  }
}) {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width * DevicePixelRatio;
  canvas.height = height * DevicePixelRatio;
  if (options.className) {
    canvas.className = options.className;
  }
  const style: any = options.style;
  if (style) {
    setElementStyle(canvas, style);
  }
  return canvas;
}
// -------------------End canvas api--------------------
export function setElementStyle(element: HTMLElement, styles: { [k: string]: any }) {
  for (const cssKey in styles) {
    const eleStyle: any = element.style;
    eleStyle[cssKey] = styles[cssKey];
  }
}

export function isZero(n: number): boolean {
  return abs(n) < Zero;
}

export function geElementOffsetFromParent(e: MouseEvent): Point {
  const element: HTMLElement = e.target as HTMLElement;
  const { clientX, clientY } = e;
  const boundRect = element.getBoundingClientRect();
  return { x: clientX - boundRect.left, y: clientY - boundRect.top };
}

//---------------Start time & date--------------
export function formatTimeStr(timeStr: string | number): string | number {
  return typeof timeStr === 'string' ? timeStr.replace(/\//g, '-') : timeStr;
}

export function getTimestamp(timeStr: string | number): number {
  timeStr = formatTimeStr(timeStr);
  return new Date(timeStr).getTime();
}

export function formatTime(time: string | number, famtter: string = 'YYYY-MM-DD hh:mm:ss') {
  const t = formatTimeStr(time);
  const d = new Date(t);
  const o = {
    "M+": d.getMonth() + 1,                 //月份 
    "D+": d.getDate(),                    //日 
    "h+": d.getHours(),                   //小时 
    "m+": d.getMinutes(),                 //分 
    "s+": d.getSeconds(),                 //秒 
  };
  if (/(Y+)/.test(famtter)) {
    famtter = famtter.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(famtter)) {
      const v = (o as any)[k];
      famtter = famtter.replace(RegExp.$1, (RegExp.$1.length === 1) ? v : (`00${v}`.substr(`${v}`.length)));
    }
  }
  return famtter;
}

export function getShowDateLabel(timestamp: number, timeScaleType: TimeScaleType, formatter?: string): string {
  if (formatter) {
    return formatTime(timestamp, formatter);
  }
  if (timeScaleType === TimeScaleType.Minute) {
    return formatTime(timestamp, 'DD hh:mm');
  } else {
    return formatTime(timestamp, 'hh:00');
  }
}
// ---------------End time & date---------------

// ---------------Start number------------------
export function formatNumber(n: number): string {
  return `0${n}`.slice(`${n}`.length - 1);
}
// ---------------End number---------------------

// ---------------Start geometry-----------------
export function isBothBoundOverlapped(boundA: Bound, boundB: Bound): boolean {
  const centerA = { x: boundA.x + boundA.width / 2, y: boundA.y + boundA.height / 2 };
  const centerB = { x: boundB.x + boundB.width / 2, y: boundB.y + boundB.height / 2 };
  return abs(centerA.x - centerB.x) <= (boundA.width + boundB.width) / 2 && 
    abs(centerA.y - centerB.y) <= (boundA.height + boundB.height) / 2; 
}
// ---------------End geometry---------------------