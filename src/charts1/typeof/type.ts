import { CSSProperties, ReactNode } from 'react'

export interface PanelOptions {
  width?: number
  height?: number
  container: HTMLElement
}

export interface CommonObject {
  [k: string]: any
}

export interface CommonContextProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode | any[]
}

export interface ChangedAttr {
  oldVal: any
  newVal: any
}

export interface CandlestickItem {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface TickData {
  p: number
  v: number | string
}

export interface AxisData {
  xAxisData: TickData[]
  yAxisData: TickData[]
}

export interface Bound {
  x: number
  y: number
  width: number
  height: number
}

export enum Trend {
  Up = 'up',
  Down = 'down',
}
export interface CandlestickBar extends Bound, CandlestickItem {
  type: Trend
  openY: number
  closeY: number
  highY: number
  lowY: number
}

export interface Point {
  x: number
  y: number
}

export enum TimeScaleType {
  Month = 'Month',
  Week = 'Week',
  Day = 'Day',
  Hour = 'Hour',
  Minute = 'Minute',
  Second = 'Second',
}

export const TimeInterval = {
  [TimeScaleType.Month]: 1,
  [TimeScaleType.Day]: 24 * 3600 * 1000,
  [TimeScaleType.Hour]: 3600 * 1000,
  [TimeScaleType.Minute]: 60 * 1000,
  [TimeScaleType.Second]: 1000,
}

export enum CommonKeys {
  Change = 'CHANGE',
}

// alphabetic ： (默认)文本基线是普通的字母基线。 英文字母底部对齐
// top ： 文本基线是 em 方框的顶端。顶部对齐
// hanging ： 文本基线是悬挂基线。 顶部对齐
// middle ： 文本基线是 em 方框的正中。中部对齐
// ideographic： 文本基线是em基线。底部对齐
// bottom ： 文本基线是 em 方框的底端。底部对齐
export enum TextBaseLine {
  Alphabetic = 'alphabetic',
  Top = 'top',
  Hanging = 'hanging',
  Middle = 'middle',
  Ideographic = 'ideographic',
  Bottom = 'bottom',
}

export enum TextAlign {
  Start = 'start', // 默认。文本在指定的位置开始。
  End = 'end', // end : 文本在指定的位置结束。
  Center = 'center', // center: 文本的中心被放置在指定的位置。
  Left = 'left', // left : 文本左对齐。
  Right = 'right', // right : 文本右对齐。
}

export const Zero: number = 1e-5

export const CanvasContextProps: Array<string | number> = [
  'strokeStyle',
  'fillStyle',
  'globalAlpha',
  'lineWidth',
  'lineCap',
  'lineJoin',
  'miterLimit',
  'shadowOffsetX',
  'shadowOffsetY',
  'shadowBlur',
  'shadowColor',
  'globalCompositeOperation',
  'font',
  'textAlign',
  'textBaseline',
]

export const ShortMonthLabel: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const RegisterEvents: string[] = ['mousedown', 'mousemove', 'mouseup', 'mouseout', 'wheel']

export interface TimeScale {
  type: TimeScaleType
  number: number
}

export const TimeScales = [
  {
    type: TimeScaleType.Month,
    number: 6,
  },
  {
    type: TimeScaleType.Month,
    number: 3,
  },
  {
    type: TimeScaleType.Month,
    number: 1,
  },
  {
    type: TimeScaleType.Day,
    number: 7,
  },
  {
    type: TimeScaleType.Day,
    number: 1,
  },
  {
    type: TimeScaleType.Hour,
    number: 6,
  },
  {
    type: TimeScaleType.Hour,
    number: 1,
  },
  {
    type: TimeScaleType.Minute,
    number: 30,
  },
  {
    type: TimeScaleType.Minute,
    number: 15,
  },
]

export enum DrawMode {
  All = 'All',
  Scene = 'Scene',
}
