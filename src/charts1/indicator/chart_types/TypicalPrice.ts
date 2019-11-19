import { CandleData } from '../StockData'
import { Indicator, IndicatorInput } from '../indicator'

export class TypicalPriceInput extends IndicatorInput {
  low?: number[]

  high?: number[]

  close?: number[]
}

export class TypicalPrice extends Indicator {
  result: number[] = []

  generator: IterableIterator<number | undefined>

  constructor(input: TypicalPriceInput) {
    super(input)
    this.generator = (function* g() {
      let priceInput = yield
      while (true) {
        // eslint-disable-next-line
        priceInput = yield (priceInput.high + priceInput.low + priceInput.close) / 3
      }
    })()

    this.generator.next()
    // @ts-ignore
    input.low.forEach((tick, index) => {
      // @ts-ignore
      let result = this.generator.next({
        // @ts-ignore
        high: input.high[index],
        // @ts-ignore
        low: input.low[index],
        // @ts-ignore
        close: input.close[index],
      })
      this.result.push(result.value)
    })
  }

  static calculate = typicalprice

  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    let result = this.generator.next(price).value
    return result
  }
}

export function typicalprice(input: TypicalPriceInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new TypicalPrice(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
