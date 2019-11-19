import { Indicator, IndicatorInput } from '../indicator'
import { CandleData } from '../StockData'

export class OBVInput extends IndicatorInput {
  close: number[]

  volume: number[]
}

export class OBV extends Indicator {
  generator: IterableIterator<number | undefined>

  constructor(input: OBVInput) {
    super(input)
    let closes = input.close
    let volumes = input.volume

    this.result = []

    this.generator = (function* g() {
      let result = 0
      let tick
      let lastClose
      tick = yield
      if (tick.close && typeof tick.close === 'number') {
        lastClose = tick.close
        tick = yield
      }
      while (true) {
        if (lastClose < tick.close) {
          result += tick.volume
        } else if (tick.close < lastClose) {
          result -= tick.volume
        }
        lastClose = tick.close
        tick = yield result
      }
    })()

    this.generator.next()

    // @ts-ignore
    closes.forEach((close, index) => {
      let tickInput = {
        close: closes[index],
        volume: volumes[index],
      }
      // @ts-ignore
      let result = this.generator.next(tickInput)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = obv

  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function obv(input: OBVInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new OBV(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
