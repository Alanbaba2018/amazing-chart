import { IndicatorInput, Indicator } from '../indicator'
import { SMA } from '../moving_averages/SMA'
import { RSI } from '../oscillators/RSI'
import { Stochastic } from './Stochastic'

export class StochasticRsiInput extends IndicatorInput {
  values: number[]

  rsiPeriod: number

  stochasticPeriod: number

  kPeriod: number

  dPeriod: number
}

export class StochasticRSIOutput {
  stochRSI: number

  k: number

  d: number
}

export class StochasticRSI extends Indicator {
  result: StochasticRSIOutput[]

  generator: IterableIterator<StochasticRSIOutput | undefined>

  constructor(input: StochasticRsiInput) {
    super(input)
    let closes = input.values
    const { rsiPeriod, stochasticPeriod, kPeriod, dPeriod } = input
    this.result = []
    this.generator = (function* g() {
      let rsi = new RSI({ period: rsiPeriod, values: [] })
      let stochastic = new Stochastic({ period: stochasticPeriod, high: [], low: [], close: [], signalPeriod: kPeriod })
      let dSma = new SMA({
        period: dPeriod,
        values: [],
      })
      let lastRSI
      let stochasticRSI
      let d
      let result
      let tick = yield
      while (true) {
        lastRSI = rsi.nextValue(tick)
        if (lastRSI !== undefined) {
          let stochasticInput = { high: lastRSI, low: lastRSI, close: lastRSI } as any
          stochasticRSI = stochastic.nextValue(stochasticInput)
          if (stochasticRSI !== undefined && stochasticRSI.d !== undefined) {
            d = dSma.nextValue(stochasticRSI.d)
            if (d !== undefined)
              result = {
                stochRSI: stochasticRSI.k,
                k: stochasticRSI.d,
                d,
              }
          }
        }
        tick = yield result
      }
    })()

    this.generator.next()

    closes.forEach((tick: any) => {
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = (input: StochasticRsiInput): StochasticRSIOutput[] => {
    Indicator.reverseInputs(input)
    let { result } = new StochasticRSI(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(input: StochasticRsiInput): StochasticRSIOutput {
    // @ts-ignore
    let nextResult = this.generator.next(input)
    if (nextResult.value !== undefined) return nextResult.value
  }
}
