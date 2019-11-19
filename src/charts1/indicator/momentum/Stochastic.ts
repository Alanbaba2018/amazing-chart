import { IndicatorInput, Indicator } from '../indicator'
import LinkedList from '../Utils/FixedSizeLinkedList'
import { SMA } from '../moving_averages/SMA'

export class StochasticInput extends IndicatorInput {
  period: number

  low: number[]

  high: number[]

  close: number[]

  signalPeriod: number
}

export class StochasticOutput {
  k: number

  d: number
}

export class Stochastic extends Indicator {
  result: StochasticOutput[]

  generator: IterableIterator<StochasticOutput | undefined>

  constructor(input: StochasticInput) {
    super(input)
    let lows = input.low
    let highs = input.high
    let closes = input.close
    const { period, signalPeriod } = input
    if (!(lows.length === highs.length && highs.length === closes.length)) {
      throw new Error('Inputs(low,high, close) not of equal size')
    }
    this.result = []
    // @ts-ignore
    this.generator = (function* g() {
      let index = 1
      let pastHighPeriods = new LinkedList(period, true, false)
      let pastLowPeriods = new LinkedList(period, false, true)
      let dSma = new SMA({
        period: signalPeriod,
        values: [],
      })
      let k
      let d
      let tick = yield
      while (true) {
        pastHighPeriods.push(tick.high)
        pastLowPeriods.push(tick.low)
        if (index < period) {
          index++
          tick = yield
        } else {
          let { periodLow } = pastLowPeriods
          k = ((tick.close - periodLow) / (pastHighPeriods.periodHigh - periodLow)) * 100
          k = isNaN(k) ? 0 : k
          d = dSma.nextValue(k)
          // eslint-disable-next-line
          tick = yield { k, d }
        }
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
        this.result.push(result.value)
      }
    })
  }

  static calculate = (input: StochasticInput): StochasticOutput[] => {
    Indicator.reverseInputs(input)
    let { result } = new Stochastic(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(input: StochasticInput): StochasticOutput {
    // @ts-ignore
    let nextResult = this.generator.next(input)
    if (nextResult.value !== undefined) return nextResult.value
  }
}
