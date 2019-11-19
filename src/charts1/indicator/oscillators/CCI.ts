import { CandleData } from '../StockData'
import { Indicator, IndicatorInput } from '../indicator'
import { SMA } from '../moving_averages/SMA'
import LinkedList from '../Utils/FixedSizeLinkedList'

export class CCIInput extends IndicatorInput {
  high: number[]

  low: number[]

  close: number[]

  period: number
}

export class CCI extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: CCIInput) {
    super(input)
    let lows = input.low
    let highs = input.high
    let closes = input.close
    let { period } = input
    let constant = 0.015
    let currentTpSet = new LinkedList(period)

    let tpSMACalculator = new SMA({
      period,
      values: [],
    })

    if (!(lows.length === highs.length && highs.length === closes.length)) {
      throw new Error('Inputs(low,high, close) not of equal size')
    }

    this.result = []

    this.generator = (function* g() {
      let tick = yield
      while (true) {
        let tp = (tick.high + tick.low + tick.close) / 3
        currentTpSet.push(tp)
        let smaTp = tpSMACalculator.nextValue(tp)
        let meanDeviation: any = null
        let cci: number
        let sum = 0
        if (smaTp !== undefined) {
          // @ts-ignore
          // eslint-disable-next-line
          for (let x of currentTpSet.iterator()) {
            sum += Math.abs(x - smaTp)
          }
          meanDeviation = sum / period
          cci = (tp - smaTp) / (constant * meanDeviation)
        }
        // @ts-ignore
        tick = yield cci
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

  static calculate = (input: CCIInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new CCI(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    let result = this.generator.next(price).value
    if (result !== undefined) {
      return result
    }
  }
}
