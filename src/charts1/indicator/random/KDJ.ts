import { IndicatorInput, Indicator } from '../indicator'

export class KDJInput extends IndicatorInput {
  periods: [number, number, number]

  values: number[]
}

export class StochasticOutput {
  k: number

  d: number

  j: number
}

export class KDJ extends Indicator {
  result: StochasticOutput[]

  generator: IterableIterator<StochasticOutput | undefined>

  constructor(input: KDJInput) {
    super(input)
    const {
      periods: [kPeriod, dPeriod, jPeriod],
      values,
    } = input
    this.result = []
    const lookback: number[] = []
    // @ts-ignore
    this.generator = (function* g() {
      // init
      let highest = 1e-15
      let lowest = 1e15
      let rsv = 100
      let pk: number = 100
      let pd: number = 100
      let pj: number = 0
      let a = 1 / dPeriod
      let b = 1 / jPeriod
      let tick = yield
      while (true) {
        if (lookback.length > kPeriod) {
          const head = lookback.shift()
          if (head === highest) {
            highest = Math.max(...lookback)
          }
          if (head === lowest) {
            lowest = Math.min(...lookback)
          }
        }
        lookback.push(tick)
        if (tick > highest) highest = tick
        if (tick < lowest) lowest = tick
        if (highest === lowest) {
          rsv = 100
        } else {
          rsv = (100 * (tick - lowest)) / (highest - lowest)
        }
        pk = a * rsv + (1 - a) * pk
        pd = b * pk + (1 - b) * pd
        pj = 3 * pk - 2 * pd
        // eslint-disable-next-line
        tick = yield { k: pk, d: pd, j: pj }
      }
    })()

    this.generator.next()

    // @ts-ignore
    values.forEach(tick => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = (input: KDJInput): StochasticOutput[] => {
    Indicator.reverseInputs(input)
    let { result } = new KDJ(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(input: KDJInput): StochasticOutput {
    // @ts-ignore
    let nextResult = this.generator.next(input)
    if (nextResult.value !== undefined) return nextResult.value
  }
}
