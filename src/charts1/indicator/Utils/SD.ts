import { IndicatorInput, Indicator } from '../indicator'
import { SMA } from '../moving_averages/SMA'
import LinkedList from './FixedSizeLinkedList'

export class SDInput extends IndicatorInput {
  period: number

  values: number[]
}

export class SD extends Indicator {
  generator: IterableIterator<number | undefined>

  constructor(input: SDInput) {
    super(input)
    const { period } = input
    let priceArray = input.values

    let sma = new SMA({
      period,
      values: [],
    })

    this.result = []

    this.generator = (function* g() {
      let tick
      let mean
      let currentSet = new LinkedList(period)
      tick = yield
      let sd: any
      while (true) {
        currentSet.push(tick)
        mean = sma.nextValue(tick)
        if (mean) {
          let sum = 0
          const list = currentSet.iterator()
          // eslint-disable-next-line
          list.forEach(cur => {
            sum += (cur - mean) ** 2
          })
          sd = Math.sqrt(sum / period)
        }
        tick = yield sd
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

  static calculate = (input: SDInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new SD(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(price: number): number | undefined {
    // @ts-ignore
    let nextResult = this.generator.next(price)
    if (nextResult.value !== undefined) return this.format(nextResult.value)
  }
}
