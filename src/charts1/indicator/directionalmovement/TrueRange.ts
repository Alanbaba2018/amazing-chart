import { CandleData } from '../StockData'
import { Indicator, IndicatorInput } from '../indicator'

export class TrueRangeInput extends IndicatorInput {
  low: number[]

  high: number[]

  close: number[]
}

export class TrueRange extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: TrueRangeInput) {
    super(input)
    var lows = input.low
    var highs = input.high
    var closes = input.close
    var format = this.format

    if (lows.length != highs.length) {
      throw 'Inputs(low,high) not of equal size'
    }

    this.result = []

    this.generator = (function*(): IterableIterator<number | undefined> {
      //@ts-ignore
      var current: CandleData = yield
      var previousClose, result
      while (true) {
        if (previousClose === undefined) {
          previousClose = current.close
          //@ts-ignore
          current = yield result
        }
        result = Math.max(
          //@ts-ignore
          current.high - current.low,
          //@ts-ignore
          isNaN(Math.abs(current.high - previousClose)) ? 0 : Math.abs(current.high - previousClose),
          //@ts-ignore
          isNaN(Math.abs(current.low - previousClose)) ? 0 : Math.abs(current.low - previousClose),
        )
        previousClose = current.close
        if (result != undefined) {
          result = format(result)
        }
        //@ts-ignore
        current = yield result
      }
    })()

    this.generator.next()

    //@ts-ignore
    lows.forEach((tick, index) => {
      //@ts-ignore
      var result = this.generator.next({
        high: highs[index],
        low: lows[index],
        close: closes[index],
      })
      if (result.value != undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = truerange

  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function truerange(input: TrueRangeInput): number[] {
  Indicator.reverseInputs(input)
  var result = new TrueRange(input).result
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
