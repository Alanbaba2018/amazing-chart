import { Indicator, IndicatorInput } from '../indicator'
import { CandleData } from '../StockData'
import { WEMA } from '../moving_averages/WEMA'
import { TrueRange } from './TrueRange'

export class ATRInput extends IndicatorInput {
  low: number[]

  high: number[]

  close: number[]

  period: number
}

export class ATR extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: ATRInput) {
    super(input)
    let lows = input.low
    let highs = input.high
    let closes = input.close
    let { period } = input

    if (!(lows.length === highs.length && highs.length === closes.length)) {
      throw new Error('Inputs(low,high, close) not of equal size')
    }

    let trueRange = new TrueRange({
      low: [],
      high: [],
      close: [],
    })

    let wema = new WEMA({
      period,
      values: [],
      format: v => v,
    })

    this.result = []

    this.generator = (function* g() {
      let tick = yield
      let avgTrueRange: number | undefined
      let trange: number | undefined
      while (true) {
        trange = trueRange.nextValue({
          low: tick.low,
          high: tick.high,
          close: tick.close,
        })
        if (trange === undefined) {
          avgTrueRange = undefined
        } else {
          avgTrueRange = wema.nextValue(trange)
        }
        tick = yield avgTrueRange
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
      })
      if (result.value !== undefined) {
        this.result.push(this.format(result.value))
      }
    })
  }

  static calculate = atr

  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function atr(input: ATRInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new ATR(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
