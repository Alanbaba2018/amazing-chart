import { TimeScaleType, ViewType } from './type'

export const GapWidgetHeight: number = 10

export const TimeInterval = {
  [TimeScaleType.Month]: 1,
  [TimeScaleType.Day]: 24 * 3600 * 1000,
  [TimeScaleType.Hour]: 3600 * 1000,
  [TimeScaleType.Minute]: 60 * 1000,
  [TimeScaleType.Second]: 1000,
}

export const Zero: number = 1e-5

export const RegisterEvents: string[] = ['click', 'mousedown', 'mousemove', 'mouseup', 'mouseout', 'wheel']

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

export const AddViewTypes = [ViewType.MACD, ViewType.ATR, ViewType.VOL]
