import { CandleData } from '../StockData'

/**
 * Created by AAravindan on 5/4/16.
 */
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
    this.generator = (function*() {
      let priceInput = yield
      while (true) {
        priceInput = yield (priceInput.high + priceInput.low + priceInput.close) / 3
      }
    })()

    this.generator.next()
    //@ts-ignore
    input.low.forEach((tick, index) => {
      //@ts-ignore
      var result = this.generator.next({
        //@ts-ignore
        high: input.high[index],
        //@ts-ignore
        low: input.low[index],
        //@ts-ignore
        close: input.close[index],
      })
      this.result.push(result.value)
    })
  }

  static calculate = typicalprice

  nextValue(price: CandleData): number | undefined {
    //@ts-ignore
    var result = this.generator.next(price).value
    return result
  }
}

export function typicalprice(input: TypicalPriceInput): number[] {
  Indicator.reverseInputs(input)
  var result = new TypicalPrice(input).result
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
