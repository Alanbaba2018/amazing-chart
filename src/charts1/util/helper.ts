import { Point, TimeScaleType, Bound, Zero, DevicePixelRatio, CanvasContextProps, CommonObject } from '../typeof/type'
import { isNumber, isString } from './type-check'

interface CanvasOptions {
  className?: string;
  style?: { [k: string]: string | number };
}
// -------------------Start canvas api--------------------
export function createCanvasElement (width: number, height: number, options: CanvasOptions = {
  style: {
    position: 'reletive', width: '100%', height: '100%',
  },
}) {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.width = width * DevicePixelRatio
  canvas.height = height * DevicePixelRatio
  if (options.className) {
    canvas.className = options.className
  }
  const { style } = options
  if (style) {
    setElementStyle(canvas, style)
  }
  return canvas
}

export function setCanvasContextStyle (ctx: CanvasRenderingContext2D, config: CommonObject) {
  CanvasContextProps.forEach(key => {
    if (config[key] !== undefined) {
      ctx[key] = config[key]
    }
  })
}
// -------------------End canvas api--------------------
export function setElementStyle (element: HTMLElement, styles: { [k: string]: any }) {
  Object.keys(styles).forEach(key => {
    element.style[key] = styles[key]
  })
}

export function isZero (n: number): boolean {
  return Math.abs(n) < Zero
}

export function geElementOffsetFromParent (e: MouseEvent): Point {
  const element: HTMLElement = e.target as HTMLElement
  const { clientX, clientY } = e
  const boundRect = element.getBoundingClientRect()
  return { x: clientX - boundRect.left, y: clientY - boundRect.top }
}

// ---------------Start time & date--------------
export function formatTimeStr (time: string | number | Date): string | number {
  if (isNumber(time)) {
    return time as number
  } if (time instanceof Date) {
    return time.getTime()
  } if (isString(time)) {
    return (time as string).replace(/\//g, '-')
  }
  return NaN
}

export function getTimestamp (timeStr: string | number): number {
  timeStr = formatTimeStr(timeStr)
  return new Date(timeStr).getTime()
}

export function formatTime (time: any, famtter: string = 'YYYY-MM-DD hh:mm:ss') {
  const t = formatTimeStr(time)
  if (isNaN(t as number)) return famtter
  const d = new Date(t)
  const o = {
    'M+': d.getMonth() + 1,                 // 月份
    'D+': d.getDate(),                    // 日
    'h+': d.getHours(),                   // 小时
    'm+': d.getMinutes(),                 // 分
    's+': d.getSeconds(),                 // 秒
  }
  if (/(Y+)/.test(famtter)) {
    famtter = famtter.replace(RegExp.$1, (`${d.getFullYear()}`).substr(4 - RegExp.$1.length))
  }
  Object.keys(o).forEach(k => {
    if (new RegExp(`(${k})`).test(famtter)) {
      const v = o[k]
      famtter = famtter.replace(RegExp.$1, (RegExp.$1.length === 1) ? v : (`00${v}`.substr(`${v}`.length)))
    }
  })
  return famtter
}

export function getAxisDateLabel (timestamp: number, timeScaleType: TimeScaleType): string {
  const d = new Date(timestamp)
  if (timeScaleType === TimeScaleType.Minute) {
    return formatTime(timestamp, 'DD hh:mm')
  } if (timeScaleType === TimeScaleType.Hour && d.getHours() === 0) {
    return formatTime(timestamp, 'MM-DD hh:00')
  }
  return formatTime(timestamp, 'hh:00')
}
// ---------------End time & date---------------

// ---------------Start number------------------
export function formatNumber (n: number): string {
  return `0${n}`.slice(`${n}`.length - 1)
}
// ---------------End number---------------------

// ---------------Start geometry-----------------
export function isBothBoundOverlapped (boundA: Bound, boundB: Bound): boolean {
  const centerA = { x: boundA.x + boundA.width / 2, y: boundA.y + boundA.height / 2 }
  const centerB = { x: boundB.x + boundB.width / 2, y: boundB.y + boundB.height / 2 }
  return Math.abs(centerA.x - centerB.x) <= (boundA.width + boundB.width) / 2
    && Math.abs(centerA.y - centerB.y) <= (boundA.height + boundB.height) / 2
}
// ---------------End geometry---------------------
