import { IndicatorInput, Indicator } from '../indicator'

export class PSARInput extends IndicatorInput {
  step: number

  max: number

  high: number[]

  low: number[]
}

export class PSAR extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: PSARInput) {
    super(input)

    let highs = input.high || []
    let lows = input.low || []

    let genFn = function*(step: number, max: number): IterableIterator<number | undefined> {
      let curr
      let extreme
      let sar
      let furthest

      let up = true
      let accel = step
      let prev: any = yield
      while (true) {
        if (curr) {
          sar += accel * (extreme - sar)

          if (up) {
            sar = Math.min(sar, furthest.low, prev.low)

            if (curr.high > extreme) {
              extreme = curr.high
              accel = Math.min(accel + step, max)
            }
          } else {
            sar = Math.max(sar, furthest.high, prev.high)

            if (curr.low < extreme) {
              extreme = curr.low
              accel = Math.min(accel + step, max)
            }
          }

          if ((up && curr.low < sar) || (!up && curr.high > sar)) {
            accel = step
            sar = extreme
            up = !up

            extreme = !up ? curr.low : curr.high
          }
        } else {
          // Randomly setup start values? What is the trend on first tick??
          sar = prev.low
          extreme = prev.high
        }

        furthest = prev
        if (curr) prev = curr
        curr = yield sar
      }
    }

    this.result = []
    this.generator = genFn(input.step, input.max)
    this.generator.next()

    // @ts-ignore
    lows.forEach((tick, index) => {
      // @ts-ignore
      let result = this.generator.next({
        high: highs[index],
        low: lows[index],
      })
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = (input: PSARInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new PSAR(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(input: PSARInput): number {
    // @ts-ignore
    let nextResult = this.generator.next(input)
    if (nextResult.value !== undefined) return nextResult.value
  }
}
