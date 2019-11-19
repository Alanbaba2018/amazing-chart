import { Indicator, IndicatorInput } from '../indicator'
import { SMA } from '../moving_averages/SMA'
import { SD } from '../Utils/SD'

export class BollingerBandsInput extends IndicatorInput {
  period: number

  stdDev: number

  values: number[]
}

export class BollingerBandsOutput extends IndicatorInput {
  middle: number

  upper: number

  lower: number

  pb: number
}

export class BollingerBands extends Indicator {
  generator: IterableIterator<BollingerBandsOutput | undefined>

  constructor(input: BollingerBandsInput) {
    super(input)
    const { period, values: priceArray, stdDev } = input

    let sma
    let sd

    this.result = []

    sma = new SMA({
      period,
      values: [],
    })
    sd = new SD({
      period,
      values: [],
    })

    this.generator = (function* g() {
      let result
      let tick
      let calcSMA
      let calcsd
      tick = yield
      while (true) {
        calcSMA = sma.nextValue(tick)
        calcsd = sd.nextValue(tick)
        if (calcSMA) {
          let middle = calcSMA
          let upper = calcSMA + calcsd * stdDev
          let lower = calcSMA - calcsd * stdDev
          let pb: number = (tick - lower) / (upper - lower)
          result = {
            middle,
            upper,
            lower,
            pb,
          }
        }
        tick = yield result
      }
    })()

    this.generator.next()

    priceArray.forEach(tick => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = bollingerbands

  nextValue(price: number): BollingerBandsOutput | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function bollingerbands(input: BollingerBandsInput): BollingerBandsOutput[] {
  Indicator.reverseInputs(input)
  let { result } = new BollingerBands(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
