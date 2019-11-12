import { Point, TimeScaleType, Bound, CommonObject, TimeScale, CandlestickItem } from '../typeof/type'
import { Zero, CanvasContextProps, TimeInterval } from '../typeof/constant'
import { isNumber, isString } from './type-check'

interface CanvasOptions {
  className?: string
  style?: { [k: string]: string | number }
}
// -------------------Start canvas api--------------------
export function createCanvasElement(
  width: number,
  height: number,
  options: CanvasOptions = {
    style: {
      position: 'reletive',
      width: '100%',
      height: '100%',
    },
  },
) {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.width = width * getDevicePixelRatio()
  canvas.height = height * getDevicePixelRatio()
  if (options.className) {
    canvas.className = options.className
  }
  const { style } = options
  if (style) {
    setElementStyle(canvas, style)
  }
  return canvas
}

export function setCanvasContextStyle(ctx: CanvasRenderingContext2D, config: CommonObject) {
  CanvasContextProps.forEach(key => {
    if (config[key] !== undefined) {
      ctx[key] = config[key]
    }
  })
}

export function cloneCanvas(targetCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = targetCanvas.width
  canvas.height = targetCanvas.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(targetCanvas, 0, 0)
  return canvas
}
// -------------------End canvas api--------------------

export function setElementStyle(element: HTMLElement, styles: { [k: string]: any }) {
  Object.keys(styles).forEach(key => {
    element.style[key] = styles[key]
  })
}

export function isZero(n: number): boolean {
  return Math.abs(n) < Zero
}

export function toFloat(v: number, decimals: number = 2): number {
  return Number(v.toFixed(decimals))
}

export function geElementOffsetFromParent(e: MouseEvent): Point {
  const element: HTMLElement = e.target as HTMLElement
  const { clientX, clientY } = e
  const boundRect = element.getBoundingClientRect()
  return { x: clientX - boundRect.left, y: clientY - boundRect.top }
}

// ---------------Start time & date--------------
export function formatTimeStr(time: string | number | Date): string | number {
  if (isNumber(time)) {
    return time as number
  }
  if (time instanceof Date) {
    return time.getTime()
  }
  if (isString(time)) {
    return (time as string).replace(/\//g, '-')
  }
  return NaN
}

export function getTimestamp(timeStr: string | number): number {
  timeStr = formatTimeStr(timeStr)
  return new Date(timeStr).getTime()
}

export function formatTime(time: any, famtter: string = 'YYYY-MM-DD hh:mm:ss') {
  const t = formatTimeStr(time)
  if (isNaN(t as number)) return famtter
  const d = new Date(t)
  const o = {
    'M+': d.getMonth() + 1, // 月份
    'D+': d.getDate(), // 日
    'h+': d.getHours(), // 小时
    'm+': d.getMinutes(), // 分
    's+': d.getSeconds(), // 秒
  }
  if (/(Y+)/.test(famtter)) {
    famtter = famtter.replace(RegExp.$1, `${d.getFullYear()}`.substr(4 - RegExp.$1.length))
  }
  Object.keys(o).forEach(k => {
    if (new RegExp(`(${k})`).test(famtter)) {
      const v = o[k]
      famtter = famtter.replace(RegExp.$1, RegExp.$1.length === 1 ? v : `00${v}`.substr(`${v}`.length))
    }
  })
  return famtter
}

export function getAxisDateLabel(timestamp: number, timeScale: TimeScale): string {
  const d = new Date(timestamp)
  if (timeScale.type === TimeScaleType.Month) {
    const formatter = d.getMonth() === 0 ? 'YYYY' : 'MM/DD'
    return formatTime(timestamp, formatter)
  }
  if (d.getHours() === 0) {
    const formatter = {
      [TimeScaleType.Month]: 'MM/DD',
      [TimeScaleType.Day]: 'MM/DD',
      [TimeScaleType.Hour]: 'MM/DD',
      [TimeScaleType.Minute]: 'hh:mm',
    }
    return formatTime(timestamp, formatter[timeScale.type])
  }
  const formatter = {
    [TimeScaleType.Day]: '',
    [TimeScaleType.Hour]: 'hh:00',
    [TimeScaleType.Minute]: 'hh:mm',
  }
  return formatTime(timestamp, formatter[timeScale.type])
}

export function getMonthsBetween(start: number, end: number) {
  const startDate = new Date(start)
  const [startYear, startMonth] = [startDate.getFullYear(), startDate.getMonth()]
  const endDate = new Date(end)
  const [endYear, endMonth] = [endDate.getFullYear(), endDate.getMonth()]
  const _endMonth = (endYear - startYear) * 12 + endMonth
  return _endMonth - startMonth + 1
}

export function getDaysBetween(start: number, end: number) {
  const startTime = getTimestamp(start)
  const endTime = getTimestamp(end)
  const interval = endTime - startTime
  return Math.floor(interval / (24 * 3600 * 1000)) + 1
}

export function getHoursBetween(start: number, end: number) {
  const startTime = getTimestamp(start)
  const endTime = getTimestamp(end)
  const interval = endTime - startTime
  return Math.floor(interval / (3600 * 1000)) + 1
}

export function getMinutesBetween(start: number, end: number) {
  const startTime = getTimestamp(start)
  const endTime = getTimestamp(end)
  const interval = endTime - startTime
  return Math.floor(interval / (60 * 1000)) + 1
}

export function getIntegerOrHalfDayTimes(start: number, end: number, integerTime: number): number[] {
  const d = new Date(start)
  const offset =
    d.getHours() * TimeInterval.Hour + d.getMinutes() * TimeInterval.Minute + d.getSeconds() * TimeInterval.Second
  let currentHour = offset === 0 ? start : start + integerTime - offset
  const results: number[] = []
  while (currentHour <= end) {
    results.push(currentHour)
    currentHour += integerTime
  }
  return results
}

export function getIntegerHourTimes(start: number, end: number): number[] {
  const firstHour = start + TimeInterval.Hour - (start % TimeInterval.Hour)
  let currentHour = firstHour
  const results: number[] = []
  while (currentHour <= end) {
    results.push(currentHour)
    currentHour += TimeInterval.Hour
  }
  return results
}

export function getIntegerWeekTimes(start: number, end: number): number[] {
  const d = new Date(start)
  const offset =
    TimeInterval.Day * 7 -
    d.getDay() * TimeInterval.Day -
    d.getHours() * TimeInterval.Hour -
    d.getMinutes() * TimeInterval.Minute -
    d.getSeconds() * TimeInterval.Second
  let currentHour = start + offset
  const results: number[] = []
  while (currentHour <= end) {
    results.push(currentHour)
    currentHour += TimeInterval.Day * 7
  }
  return results
}

export function getMonthFirstDayTimes(start: number, end: number, step: number = 1): number[] {
  const startDate = new Date(start)
  const year = startDate.getFullYear()
  let currentMonth = 0
  let currentTime = new Date(year, currentMonth, 1).getTime()
  const results: number[] = []
  while (currentTime <= end) {
    currentTime >= start && results.push(currentTime)
    currentMonth += step
    currentTime = new Date(year, currentMonth, 1).getTime()
  }
  return results
}
// ---------------End time & date---------------

// ---------------Start number------------------
export function formatNumber(n: number): string {
  return `0${n}`.slice(`${n}`.length - 1)
}
// ---------------End number---------------------

// ---------------Start geometry-----------------
export function isBothBoundOverlapped(boundA: Bound, boundB: Bound): boolean {
  const centerA = { x: boundA.x + boundA.width / 2, y: boundA.y + boundA.height / 2 }
  const centerB = { x: boundB.x + boundB.width / 2, y: boundB.y + boundB.height / 2 }
  return (
    Math.abs(centerA.x - centerB.x) <= (boundA.width + boundB.width) / 2 &&
    Math.abs(centerA.y - centerB.y) <= (boundA.height + boundB.height) / 2
  )
}
export function isBoundContain(bound: Bound, point: Point): boolean {
  return point.x > bound.x && point.y > bound.y && point.x - bound.x < bound.width && point.y - bound.y < bound.height
}
// ---------------End geometry---------------------

export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

// ---------------Start format candlestick data------

export function calculateMA(candleList: CandlestickItem[], index: number, period: number) {
  const item = candleList[index]
  if (index < period - 1) {
    item[`MA${period}`] = NaN
    return
  }
  const lastMA = candleList[index - 1][`MA${period}`]
  if (isNaN(lastMA)) {
    let sum = 0
    for (let i = index; i > index - period; i--) {
      sum += candleList[i].close
    }
    item[`MA${period}`] = Number((sum / period).toFixed(2))
  } else {
    item[`MA${period}`] = Number((lastMA - candleList[index - period].close / period + item.close / period).toFixed(2))
  }
}
// -------------End calculate cnadlestick indicator--------

export function isMobile(): boolean {
  const u = navigator.userAgent
  const reg = /(AppleWebKit.*Mobile.*)|(\(i[^;]+;( U;)? CPU.+Mac OS X)|(Android)|(Adr)/
  return reg.test(u)
}
