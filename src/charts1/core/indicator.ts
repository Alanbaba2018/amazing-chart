import { CandlestickItem, ChartType, ColorMap } from '../typeof/type'
// import { isNumber } from '../util/type-check'
import * as IndicatorHelper from '../indicator'

export interface PlotItem {
  time: number
  value: number
}
interface DefaultProps {
  readonly title: string
  readonly isHistBase: boolean
  readonly isScaleCenter: boolean
}
export interface IndicatorResult {
  data: PlotItem[]
  chartType: ChartType
  color: string
  lineWidth?: number
  [k: string]: any
}
interface IndicatorBase {
  defaultProps: DefaultProps
  getResult(data: CandlestickItem[], params: any, source: string): IndicatorResult[]
}

function combinData(seriesData: CandlestickItem[], lists: number[][]): PlotItem[][] {
  return lists.map(values => {
    const offset = seriesData.length - values.length
    return values.map((val, _index) => ({ time: seriesData[_index + offset].time, value: val }))
  })
}
const SMA: IndicatorBase = {
  defaultProps: {
    title: 'SMA',
    isHistBase: true,
    isScaleCenter: true,
  },
  getResult(seriesData: CandlestickItem[], { periods = [], source = 'open', colors = [] }) {
    const prices = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    periods.forEach((period, index) => {
      const values: number[] = IndicatorHelper.SMA.calculate({ period, values: prices })
      const [data] = combinData(seriesData, [values])
      results.push({
        data,
        chartType: ChartType.Line,
        color: colors[index],
      })
    })
    return results
  },
}

const VOL: IndicatorBase = {
  defaultProps: {
    title: 'VOL',
    isHistBase: false,
    isScaleCenter: false,
  },
  getResult(
    seriesData: CandlestickItem[],
    { periods = [], source = 'volume', upColor = ColorMap.CandleRed, downColor = ColorMap.CandleGreen, colors = [] },
  ) {
    const volumes = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    periods.forEach((period, index) => {
      const values: number[] = IndicatorHelper.SMA.calculate({ period, values: volumes })
      const [data] = combinData(seriesData, [values])
      results.push({
        data,
        chartType: ChartType.Line,
        color: colors[index],
      })
    })
    const upData: PlotItem[] = []
    const downData: PlotItem[] = []
    for (let i = 0; i < seriesData.length; i++) {
      const item = seriesData[i]
      const list = item.close > item.open ? upData : downData
      list.push({ time: item.time, value: volumes[i] })
    }
    const extent = [Math.min(...volumes), Math.max(...volumes)]
    results.push({
      data: upData,
      chartType: ChartType.Bar,
      color: upColor,
      extent,
    })
    results.push({
      data: downData,
      chartType: ChartType.Bar,
      color: downColor,
      extent,
    })
    return results
  },
}

const EMA: IndicatorBase = {
  defaultProps: {
    title: 'EMA',
    isHistBase: true,
    isScaleCenter: true,
  },
  getResult(seriesData: CandlestickItem[], { periods = [], source = 'open', colors = [] }) {
    const prices = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    periods.forEach((period, index) => {
      const values: number[] = IndicatorHelper.EMA.calculate({ period, values: prices })
      const offset = seriesData.length - values.length
      const data = values.map((val, _index) => ({ time: seriesData[_index + offset].time, value: val }))
      results.push({
        data,
        chartType: ChartType.Line,
        color: colors[index],
      })
    })
    return results
  },
}

const WMA: IndicatorBase = {
  defaultProps: {
    title: 'WMA',
    isHistBase: true,
    isScaleCenter: true,
  },
  getResult(seriesData: CandlestickItem[], { periods = [], source = 'open', colors = [] }) {
    const prices = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    periods.forEach((period, index) => {
      const values: number[] = IndicatorHelper.WMA.calculate({ period, values: prices })
      const offset = seriesData.length - values.length
      const data = values.map((val, _index) => ({ time: seriesData[_index + offset].time, value: val }))
      results.push({
        data,
        chartType: ChartType.Line,
        color: colors[index],
      })
    })
    return results
  },
}

const MACD: IndicatorBase = {
  defaultProps: {
    title: 'MACD',
    isHistBase: false,
    isScaleCenter: true,
  },
  getResult(
    seriesData: CandlestickItem[],
    {
      fastPeriod = 10,
      slowPeriod = 26,
      signalPeriod = 9,
      mainColor = ColorMap.White,
      signalColor = ColorMap.White,
      upColor = ColorMap.CandleRed,
      downColor = ColorMap.CandleGreen,
      source = 'open',
    },
  ) {
    const prices = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    const _results = IndicatorHelper.MACD.calculate({
      fastPeriod,
      slowPeriod,
      signalPeriod,
      values: prices,
    })
    const { macd, signal, histogram } = _results.reduce(
      (acc: { macd: number[]; signal: number[]; histogram: number[] }, item) => {
        item.MACD && acc.macd.push(item.MACD)
        item.signal && acc.signal.push(item.signal)
        item.histogram && acc.histogram.push(item.histogram)
        return acc
      },
      { macd: [], signal: [], histogram: [] },
    )
    const [mainData, signalData, histogramData] = combinData(seriesData, [macd, signal, histogram])
    results.push({
      data: mainData,
      chartType: ChartType.Line,
      color: mainColor,
    })
    results.push({
      data: signalData,
      chartType: ChartType.Line,
      color: signalColor,
    })
    const upData: PlotItem[] = []
    const downData: PlotItem[] = []
    for (let i = 0; i < histogramData.length; i++) {
      const list = histogramData[i].value > 0 ? upData : downData
      list.push(histogramData[i])
    }
    results.push({
      data: upData,
      chartType: ChartType.Bar,
      color: upColor,
    })
    results.push({
      data: downData,
      chartType: ChartType.Bar,
      color: downColor,
    })
    return results
  },
}

const RSI: IndicatorBase = {
  defaultProps: {
    title: 'RSI',
    isHistBase: false,
    isScaleCenter: true,
  },
  getResult(seriesData: CandlestickItem[], { periods = [], source = 'open', colors = [] }) {
    const prices = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    periods.forEach((period, index) => {
      const values: number[] = IndicatorHelper.RSI.calculate({ period, values: prices })
      const [data] = combinData(seriesData, [values])
      results.push({
        data,
        chartType: ChartType.Line,
        color: colors[index],
      })
    })
    return results
  },
}

const BOLL: IndicatorBase = {
  defaultProps: {
    title: 'BOLL',
    isHistBase: true,
    isScaleCenter: true,
  },
  getResult(seriesData: CandlestickItem[], { period = 21, stdDev = 2, source = 'open', colors = [] }) {
    const prices = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    const _results = IndicatorHelper.BollingerBands.calculate({ period, values: prices, stdDev })
    const { middle, upper, lower } = _results.reduce(
      (acc: { middle: number[]; upper: number[]; lower: number[] }, item) => {
        acc.middle.push(item.middle)
        acc.upper.push(item.upper)
        acc.lower.push(item.lower)
        return acc
      },
      { middle: [], upper: [], lower: [] },
    )
    const [middleData, upperData, lowerData] = combinData(seriesData, [middle, upper, lower])
    results.push({
      data: middleData,
      chartType: ChartType.Line,
      color: colors[0],
    })
    results.push({
      data: upperData,
      chartType: ChartType.Line,
      color: colors[1],
    })
    results.push({
      data: lowerData,
      chartType: ChartType.Line,
      color: colors[2],
    })
    return results
  },
}

const KDJ: IndicatorBase = {
  defaultProps: {
    title: 'KDJ',
    isHistBase: false,
    isScaleCenter: true,
  },
  getResult(seriesData: CandlestickItem[], { periods = [], colors = [], lineWidth = 1, source = 'close' }) {
    const values = seriesData.map(item => item[source])
    const results: IndicatorResult[] = []
    const _results = IndicatorHelper.KDJ.calculate({ periods, values })
    const { k, d, j } = _results.reduce(
      (acc: { k: number[]; d: number[]; j: number[] }, item) => {
        acc.k.push(item.k)
        acc.d.push(item.d)
        acc.j.push(item.j)
        return acc
      },
      { k: [], d: [], j: [] },
    )
    const [kData, dData, jData] = combinData(seriesData, [k, d, j])
    results.push({
      data: kData,
      chartType: ChartType.Line,
      color: colors[0] || ColorMap.White,
      lineWidth,
    })
    results.push({
      data: dData,
      chartType: ChartType.Line,
      color: colors[1] || ColorMap.White,
      lineWidth,
    })
    results.push({
      data: jData,
      chartType: ChartType.Line,
      color: colors[2] || ColorMap.White,
      lineWidth,
    })
    return results
  },
}

// const ATR = {
//   title: 'ATR',
//   type: ChartType.Custom,
//   key: 'ATR',
//   getTR(current: CandlestickItem, prev: CandlestickItem, source: string = 'close'): number {
//     const HL = current.high - current.low
//     if (!prev) return HL
//     const HCp = Math.abs(current.high - prev[source])
//     const LCp = Math.abs(current.low - prev[source])
//     return Math.max(HL, HCp, LCp)
//   },
//   calculate(seriesData: CandlestickItem[], params: { periods: number[] }, source: string = 'close') {
//     params.periods.forEach(period => {
//       let TR = 0
//       for (let i = 0; i < seriesData.length; i++) {
//         const current = seriesData[i]
//         const prev = seriesData[i - 1]
//         const currentTR = this.getTR(current, prev, source)
//         if (i > period - 1) {
//           current[`${this.key}${period}`] = (prev[`${this.key}${period}`] * (period - 1) + currentTR) / period
//         } else if (i === period - 1) {
//           current[`${this.key}${period}`] = TR / i
//         } else {
//           TR += currentTR
//         }
//       }
//     })
//   },
// }

// const BOLL = {
//   title: 'BOLL',
//   type: ChartType.Custom,
//   key: 'BOLL',
//   upKey: 'UP',
//   mdKey: 'MB',
//   dnKey: 'DN',
//   getStandardDeviation(seriesData: CandlestickItem[], mean: number, source: string) {
//     const variance = seriesData.reduce((acc, cur) => acc + (cur[source] - mean) ** 2, 0)
//     const std = Math.sqrt(variance / (seriesData.length - 1))
//     return std
//   },
//   calculate(seriesData: CandlestickItem[], params: BollParams, source: string = 'close') {
//     const { period, standardDeviation } = params
//     let sum = 0
//     let mean = 0
//     let stdDev = 0
//     if (seriesData.length < period) return
//     for (let i = period; i <= seriesData.length; i++) {
//       const sliceData = seriesData.slice(i - period, i)
//       sum = sliceData.reduce((acc, cur) => acc + cur[source], 0)
//       mean = sum / period
//       stdDev = this.getStandardDeviation(sliceData, mean, source)
//       seriesData[i - 1][`${this.mdKey}`] = mean
//       seriesData[i - 1][`${this.upKey}`] = mean + standardDeviation * stdDev
//       seriesData[i - 1][`${this.dnKey}`] = mean - standardDeviation * stdDev
//     }
//   },
// }

// export { EMA, MACD, SMA, MOMENTUM, ATR, BOLL, VOL }
const module = {
  VOL,
  SMA,
  EMA,
  WMA,
  MACD,
  RSI,
  BOLL,
  KDJ,
}
export default module
