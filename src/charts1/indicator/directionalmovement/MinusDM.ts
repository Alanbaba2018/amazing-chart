import { Indicator, IndicatorInput } from '../indicator'

export class MDMInput extends IndicatorInput {
  low: number[]

  high: number[]
}

export class MDM extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: MDMInput) {
    super(input)
    let lows = input.low
    let highs = input.high

    if (lows.length !== highs.length) {
      throw new Error('Inputs(low,high) not of equal size')
    }
    this.result = []
    this.generator = (function* g() {
      let minusDm
      let current = yield
      let last
      while (true) {
        if (last) {
          let upMove = current.high - last.high
          let downMove = last.low - current.low
          minusDm = downMove > upMove && downMove > 0 ? downMove : 0
        }
        last = current
        current = yield minusDm
      }
    })()

    this.generator.next()

    // @ts-ignore
    lows.forEach((tick, index) => {
      // @ts-ignore
      let result = this.generator.next({
        high: highs[index],
        low: lows[index],
      })
      if (result.value !== undefined) this.result.push(result.value)
    })
  }

  static calculate(input: MDMInput): number[] {
    Indicator.reverseInputs(input)
    let { result } = new MDM(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  nextValue(price: number): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}
