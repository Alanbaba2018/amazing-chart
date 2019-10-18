import { pow, ln, ceil, abs } from './math';
import { Zero } from '../typeof/const';
import { Point } from '../typeof/type';

interface CanvasOptions {
  className?: string;
  style?: {[k: string]: string | number};
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
    tickNumber: originNumber
  };
}
// -------------------Start canvas api--------------------
export function createCanvasElement(width: number, height: number, options: CanvasOptions = { style: {
  position: 'reletive', width: '100%', height: '100%'
}}) {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
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
export function setElementStyle(element: HTMLElement, styles: {[k: string]: any}) {
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
// ---------------End time & date---------------