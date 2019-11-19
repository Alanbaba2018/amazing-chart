import { ROC } from './ROC'
import { EMA } from '../moving_averages/EMA'
import { Indicator, IndicatorInput } from '../indicator'

export class TRIXInput extends IndicatorInput {
  values: number[]

  period: number
}

export class TRIX extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: TRIXInput) {
    super(input)
    let priceArray = input.values
    let { period } = input

    let ema = new EMA({
      period,
      values: [],
    })
    let emaOfema = new EMA({
      period,
      values: [],
    })
    let emaOfemaOfema = new EMA({
      period,
      values: [],
    })
    let trixROC = new ROC({
      period: 1,
      values: [],
    })

    this.result = []

    this.generator = (function* g(): IterableIterator<number | undefined> {
      let tick: any = yield
      while (true) {
        let initialema = ema.nextValue(tick)
        let smoothedResult = initialema ? emaOfema.nextValue(initialema) : undefined
        let doubleSmoothedResult = smoothedResult ? emaOfemaOfema.nextValue(smoothedResult) : undefined
        let result = doubleSmoothedResult ? trixROC.nextValue(doubleSmoothedResult) : undefined
        tick = yield result || undefined
      }
    })()

    this.generator.next()

    priceArray.forEach(tick => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = trix

  nextValue(price: number) {
    // @ts-ignore
    let nextResult = this.generator.next(price)
    if (nextResult.value !== undefined) return nextResult.value
  }
}

export function trix(input: TRIXInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new TRIX(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
