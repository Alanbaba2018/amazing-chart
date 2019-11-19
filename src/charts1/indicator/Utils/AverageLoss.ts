import { Indicator, IndicatorInput } from '../indicator'

export class AvgLossInput extends IndicatorInput {
  values: number[]

  period: number
}

export class AverageLoss extends Indicator {
  generator: IterableIterator<number | undefined>

  constructor(input: AvgLossInput) {
    super(input)
    const { values, period } = input

    this.generator = (function* g(_period) {
      let currentValue = yield
      let counter = 1
      let lossSum = 0
      let avgLoss
      let loss
      let lastValue = currentValue
      currentValue = yield
      while (true) {
        loss = lastValue - currentValue
        loss = loss > 0 ? loss : 0
        if (loss > 0) {
          lossSum += loss
        }
        if (counter < _period) {
          counter++
        } else if (avgLoss === undefined) {
          avgLoss = lossSum / _period
        } else {
          avgLoss = (avgLoss * (_period - 1) + loss) / _period
        }
        lastValue = currentValue
        currentValue = yield avgLoss
      }
    })(period)

    this.generator.next()

    this.result = []

    values.forEach((tick: number) => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = averageloss

  nextValue(price: number): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function averageloss(input: AvgLossInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new AverageLoss(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
