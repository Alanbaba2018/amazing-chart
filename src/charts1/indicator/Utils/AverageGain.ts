import { Indicator, IndicatorInput } from '../indicator'

export class AvgGainInput extends IndicatorInput {
  period: number

  values: number[]
}

export class AverageGain extends Indicator {
  generator: IterableIterator<number | undefined>

  constructor(input: AvgGainInput) {
    super(input)
    const { values, period } = input

    this.generator = (function* g(_period) {
      let currentValue = yield
      let counter = 1
      let gainSum = 0
      let avgGain
      let gain
      let lastValue = currentValue
      currentValue = yield
      while (true) {
        gain = currentValue - lastValue
        gain = gain > 0 ? gain : 0
        if (gain > 0) {
          gainSum += gain
        }
        if (counter < _period) {
          counter++
        } else if (avgGain === undefined) {
          avgGain = gainSum / _period
        } else {
          avgGain = (avgGain * (_period - 1) + gain) / _period
        }
        lastValue = currentValue
        currentValue = yield avgGain
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

  static calculate = averagegain

  nextValue(price: number): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function averagegain(input: AvgGainInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new AverageGain(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
