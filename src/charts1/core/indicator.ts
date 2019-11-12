import { CandlestickItem, ChartType } from '../typeof/type'
import { isNumber } from '../util/type-check'

interface MacdParams {
  shortPeriod: number
  longPeriod: number
  signalPeriod: number
  period: number
}
interface BollParams {
  period: number
  standardDeviation: number
}
const EMA = {
  title: 'EMA',
  type: ChartType.Custom,
  key: 'EMA',
  accumulatePeriodData(seriesData: CandlestickItem[], period: number, source: string) {
    let sum = 0
    let i = 0
    while (i < period) {
      sum += seriesData[i][source]
      i++
    }
    return sum
  },
  calculate(
    seriesData: CandlestickItem[],
    params: { periods: number[] },
    source: string = 'close',
    overrideKey?: string,
  ) {
    params.periods.forEach(period => {
      const sum = this.accumulatePeriodData(seriesData, period, source)
      const SMA = sum / period
      const propKey = overrideKey || `${this.key}${period}`
      const coeff = 2.0 / (period + 1)
      for (let i = period - 1; i < seriesData.length; i++) {
        const current = seriesData[i]
        if (!seriesData[i - 1] || !seriesData[i - 1][propKey]) {
          current[propKey] = SMA
        } else {
          const lastEmaValue = seriesData[i - 1][propKey]
          current[propKey] = current[source] * coeff + lastEmaValue * (1 - coeff)
        }
      }
    })
  },
}

const MACD = {
  title: 'MACD',
  type: ChartType.Custom,
  key: 'MACD', // MACD line(DIFF)
  oscillatorKey: 'OSC', // Oscillator(震荡指标)
  signalKey: 'SIGNAL', // signal line(信号线)
  calculate(seriesData: CandlestickItem[], params: MacdParams, source: string = 'open') {
    const { longPeriod, shortPeriod, signalPeriod } = params
    if (seriesData.length < longPeriod + shortPeriod) return
    EMA.calculate(seriesData, { periods: [longPeriod, shortPeriod] }, source)
    for (let i = longPeriod - 1; i < seriesData.length; i++) {
      const current = seriesData[i]
      if (isNumber(current[`${EMA.key}${longPeriod}`]) && isNumber(current[`${EMA.key}${shortPeriod}`])) {
        current[this.key] = current[`${EMA.key}${shortPeriod}`] - current[`${EMA.key}${longPeriod}`]
      }
    }
    EMA.calculate(seriesData.slice(longPeriod - 1), { periods: [signalPeriod] }, this.key, this.signalKey)
    for (let i = longPeriod - 1; i < seriesData.length; i++) {
      const current = seriesData[i]
      if (isNumber(current[`${this.key}`]) && isNumber(current[`${this.signalKey}`])) {
        current[this.oscillatorKey] = current[`${this.key}`] - current[`${this.signalKey}`]
      }
    }
  },
}

const SMA = {
  title: 'SMA',
  type: ChartType.Custom,
  key: 'SMA',
  calculate(seriesData: CandlestickItem[], params: { periods: number[] }, source: string = 'open') {
    params.periods.forEach(period => {
      if (period > seriesData.length) return
      let sum = EMA.accumulatePeriodData(seriesData, period - 1, source)
      for (let i = period - 1; i < seriesData.length; i++) {
        const current = seriesData[i]
        sum += current[source]
        current[`${this.key}${period}`] = sum / period
        sum -= seriesData[i - period + 1][source]
      }
    })
  },
}

const MOMENTUM = {
  title: 'MOMENTUM',
  type: ChartType.Custom,
  key: 'MOMENTUM',
  calculate(seriesData: CandlestickItem[], params: { periods: number[] }, source: string = 'close') {
    params.periods.forEach(period => {
      for (let i = period; i < seriesData.length; i++) {
        const current = seriesData[i]
        current[`${this.key}${period}`] = current[source] - seriesData[i - period][source]
      }
    })
  },
}

const ATR = {
  title: 'ATR',
  type: ChartType.Custom,
  key: 'ATR',
  getTR(current: CandlestickItem, prev: CandlestickItem, source: string = 'close'): number {
    const HL = current.high - current.low
    if (!prev) return HL
    const HCp = Math.abs(current.high - prev[source])
    const LCp = Math.abs(current.low - prev[source])
    return Math.max(HL, HCp, LCp)
  },
  calculate(seriesData: CandlestickItem[], params: { periods: number[] }, source: string = 'close') {
    params.periods.forEach(period => {
      let TR = 0
      for (let i = 0; i < seriesData.length; i++) {
        const current = seriesData[i]
        const prev = seriesData[i - 1]
        const currentTR = this.getTR(current, prev, source)
        if (i > period - 1) {
          current[`${this.key}${period}`] = (prev[`${this.key}${period}`] * (period - 1) + currentTR) / period
        } else if (i === period - 1) {
          current[`${this.key}${period}`] = TR / i
        } else {
          TR += currentTR
        }
      }
    })
  },
}

const BOLL = {
  title: 'BOLL',
  type: ChartType.Custom,
  key: 'BOLL',
  upKey: 'UP',
  mdKey: 'MB',
  dnKey: 'DN',
  getStandardDeviation(seriesData: CandlestickItem[], mean: number, source: string) {
    const variance = seriesData.reduce((acc, cur) => acc + (cur[source] - mean) ** 2, 0)
    const std = Math.sqrt(variance / (seriesData.length - 1))
    return std
  },
  calculate(seriesData: CandlestickItem[], params: BollParams, source: string = 'close') {
    const { period, standardDeviation } = params
    let sum = 0
    let mean = 0
    let stdDev = 0
    if (seriesData.length < period) return
    for (let i = period; i <= seriesData.length; i++) {
      const sliceData = seriesData.slice(i - period, i)
      sum = sliceData.reduce((acc, cur) => acc + cur[source], 0)
      mean = sum / period
      stdDev = this.getStandardDeviation(sliceData, mean, source)
      seriesData[i - 1][`${this.mdKey}`] = mean
      seriesData[i - 1][`${this.upKey}`] = mean + standardDeviation * stdDev
      seriesData[i - 1][`${this.dnKey}`] = mean - standardDeviation * stdDev
    }
  },
}

const VOL = {
  title: 'VOL',
  type: ChartType.Standard,
  key: 'VOL',
  calculate() {},
}

export { EMA, MACD, SMA, MOMENTUM, ATR, BOLL, VOL }
