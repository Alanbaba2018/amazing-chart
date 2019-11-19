import { Indicator, IndicatorInput } from '../indicator'
import { LinkedList } from '../Utils/LinkedList'

export class MAInput extends IndicatorInput {
  constructor(public period: number, public values: number[]) {
    super()
  }
}

export class SMA extends Indicator {
  period: number

  price: number[]

  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: MAInput) {
    super(input)
    this.period = input.period
    this.price = input.values
    let genFn = function*(period: number): IterableIterator<number | undefined> {
      let list = new LinkedList()
      let sum = 0
      let counter = 1
      let current = yield
      let result
      list.push(0)
      while (true) {
        if (counter < period) {
          counter++
          list.push(current)
          // @ts-ignore
          sum += current
        } else {
          // @ts-ignore
          sum = sum - list.shift() + current
          result = sum / period
          list.push(current)
        }
        current = yield result
      }
    }
    this.generator = genFn(this.period)
    this.generator.next()
    this.result = []
    this.price.forEach(tick => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(this.format(result.value))
      }
    })
  }

  static calculate = (input: MAInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new SMA(input)
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
