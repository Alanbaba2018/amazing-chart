import { Indicator, IndicatorInput } from '../indicator'
import LinkedList from '../Utils/FixedSizeLinkedList'

export class ROCInput extends IndicatorInput {
  period: number

  values: number[]
}

export class ROC extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: ROCInput) {
    super(input)
    const { period } = input
    let priceArray = input.values
    this.result = []
    this.generator = (function* g() {
      let index = 1
      let pastPeriods = new LinkedList(period)
      let tick = yield
      let roc
      while (true) {
        pastPeriods.push(tick)
        if (index < period) {
          index++
        } else {
          roc = ((tick - pastPeriods.lastShift) / pastPeriods.lastShift) * 100
        }
        tick = yield roc
      }
    })()

    this.generator.next()

    priceArray.forEach((tick: any) => {
      let result = this.generator.next(tick)
      if (result.value !== undefined && !isNaN(result.value)) {
        this.result.push(this.format(result.value))
      }
    })
  }

  static calculate = (input: ROCInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new ROC(input)
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
    if (nextResult.value !== undefined && !isNaN(nextResult.value)) {
      return this.format(nextResult.value)
    }
  }
}
