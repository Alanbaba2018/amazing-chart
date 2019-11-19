import { Indicator } from '../indicator'
import { MAInput } from './SMA'
import { LinkedList } from '../Utils/LinkedList'

export class WMA extends Indicator {
  period: number

  price: number[]

  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: MAInput) {
    super(input)
    let { period } = input
    let priceArray = input.values
    this.result = []
    this.generator = (function* g() {
      let data = new LinkedList()
      let denominator = (period * (period + 1)) / 2

      while (true) {
        if (data.length < period) {
          data.push(yield)
        } else {
          data.resetCursor()
          let result = 0
          for (let i = 1; i <= period; i++) {
            result += (data.next() * i) / denominator
          }
          let next = yield result
          data.shift()
          data.push(next)
        }
      }
    })()

    this.generator.next()

    priceArray.forEach((tick: any) => {
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(this.format(result.value))
      }
    })
  }

  static calculate = (input: MAInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new WMA(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(price: number): number | undefined {
    // @ts-ignore
    let result = this.generator.next(price).value
    if (result !== undefined) return this.format(result)
  }
}
