import { CSSProperties, ReactNode } from 'react'

export interface PanelOptions extends CandlestickConfig {
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
  volume: number
  [k: string]: any
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

export interface TimeScale {
  type: TimeScaleType
  number: number
}

export enum DrawMode {
  All = 'All',
  YAxis = 'YAxis',
  XAxis = 'XAxis',
}

export enum IndicatorType {
  CANDLE = 'CANDLE',
  MACD = 'MACD',
  EMA = 'EMA',
  MA = 'MA',
  SMA = 'SMA',
  MOMENTUM = 'MOMENTUM',
  ATR = 'ATR',
  BOLL = 'BOLL',
  VOL = 'VOL',
}
export interface IndicatorView {
  type: IndicatorType
  params: { [k: string]: any }
  styles: CommonObject
  isHistBase: boolean
  isScaleCenter: boolean
}

export enum ColorMap {
  White = '#ffffff',
  Black = '#000000',
  Gray = '#2d2d2d',
  CandleRed = '#ff0372',
  CandleBorderRed = '#c60606',
  CandleGreen = '#00c582',
  LightGray = '#9a9b9a',
}

export interface Margin {
  left: number
  right: number
  top: number
  bottom: number
}
export interface RectStyles {
  fillStyle: string
  strokeStyle: string
  lineWidth: number
}
export interface AxisConfig {
  textBaseline: TextBaseLine
  textAlign: TextAlign
  strokeStyle?: string
  fillStyle?: string
  tickColor: string
  tickWidth: number
  textMargin: number
  scaleRatio?: number
}

export interface xAxisConfig extends AxisConfig {
  height: number
}
export interface yAxisConfig extends AxisConfig {
  width: number
}
export interface TimelineConfig extends xAxisConfig {
  timeAxisHeight: number
  borderColor: string
  shadowColor: string
  sliderColor: string
  trenLineColor: string
  tickMarkColor: string
}
export interface CandlestickConfig {
  margin?: Margin
  background?: string
  candlestick?: {
    barWeight: number
    [Trend.Up]: RectStyles
    [Trend.Down]: RectStyles
    grid: {
      strokeStyle: string
      lineWidth: number
    }
  }
  crossHair?: {
    show: boolean
    lineColor: string
    labelBackground: string
    xLabelColor: string
    yLabelColor: string
  }
  xAxis?: xAxisConfig
  yAxis?: yAxisConfig
  timeline?: TimelineConfig
  indicators?: IndicatorView[]
}

interface TextLabel {
  point: Point
  text: string
  color: string
}
export interface AxisLabels {
  xLabel: TextLabel
  yLabel: TextLabel
  bgColor: string
}

export enum PanelType {
  BASE = 'BASE',
  EXT = 'EXT',
}

export interface StandardBar {
  x: number
  y: number
  width: number
  height: number
}

export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Right = 'RIGHT',
  Left = 'LEFT',
}

export enum ChartType {
  Line = 'LINE',
  Bar = 'BAR',
  Area = 'AREA',
  Standard = 'STANDARD',
  Custom = 'CUSTOM',
}
