import { Indicator } from '../indicator'
import { MAInput, SMA } from './SMA'

export class EMA extends Indicator {
  period: number

  price: number[]

  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: MAInput) {
    super(input)
    let { period } = input
    let priceArray = input.values
    let exponent = 2 / (period + 1)
    let sma: SMA

    this.result = []

    sma = new SMA({ period, values: [] })

    let genFn = function*(): IterableIterator<number | undefined> {
      let tick: any = yield
      let prevEma
      while (true) {
        if (prevEma !== undefined && tick !== undefined) {
          prevEma = (tick - prevEma) * exponent + prevEma
          tick = yield prevEma
        } else {
          tick = yield
          prevEma = sma.nextValue(tick)
          if (prevEma) tick = yield prevEma
        }
      }
    }

    this.generator = genFn()

    this.generator.next()
    this.generator.next()

    priceArray.forEach(tick => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(this.format(result.value))
      }
    })
  }

  static calculate = (input: MAInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new EMA(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(price: any) {
    let result = this.generator.next(price).value
    if (result !== undefined) return this.format(result)
  }
}
