import { CandleData } from '../StockData'
import { Indicator, IndicatorInput } from '../indicator'

export class VWAPInput extends IndicatorInput {
  high: number[]

  low: number[]

  close: number[]

  volume: number[]
}

export class VWAP extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: VWAPInput) {
    super(input)
    let lows = input.low
    let highs = input.high
    let closes = input.close
    let volumes = input.volume

    if (!(lows.length === highs.length && highs.length === closes.length)) {
      throw new Error('Inputs(low,high, close) not of equal size')
    }

    this.result = []

    this.generator = (function* g() {
      let tick = yield
      let cumulativeTotal = 0
      let cumulativeVolume = 0
      while (true) {
        let typicalPrice = (tick.high + tick.low + tick.close) / 3
        let total = tick.volume * typicalPrice
        cumulativeTotal += total
        cumulativeVolume += tick.volume
        tick = yield cumulativeTotal / cumulativeVolume
      }
    })()

    this.generator.next()

    // @ts-ignore
    lows.forEach((tick, index) => {
      // @ts-ignore
      let result = this.generator.next({
        high: highs[index],
        low: lows[index],
        close: closes[index],
        volume: volumes[index],
      })
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = vwap

  // @ts-ignore
  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    let result = this.generator.next(price).value
    if (result !== undefined) {
      return result
    }
  }
}

export function vwap(input: VWAPInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new VWAP(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
