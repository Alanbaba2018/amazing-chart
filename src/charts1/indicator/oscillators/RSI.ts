import { Indicator, IndicatorInput } from '../indicator'
import { AverageGain } from '../Utils/AverageGain'
import { AverageLoss } from '../Utils/AverageLoss'

export class RSIInput extends IndicatorInput {
  period: number

  values: number[]
}

export class RSI extends Indicator {
  generator: IterableIterator<number | undefined>

  constructor(input: RSIInput) {
    super(input)
    const { period, values } = input

    let GainProvider = new AverageGain({ period, values: [] })
    let LossProvider = new AverageLoss({ period, values: [] })
    this.generator = (function* g() {
      let current = yield
      let lastAvgGain
      let lastAvgLoss
      let RS
      let currentRSI
      while (true) {
        lastAvgGain = GainProvider.nextValue(current)
        lastAvgLoss = LossProvider.nextValue(current)
        if (lastAvgGain !== undefined && lastAvgLoss !== undefined) {
          if (lastAvgLoss === 0) {
            currentRSI = 100
          } else if (lastAvgGain === 0) {
            currentRSI = 0
          } else {
            RS = lastAvgGain / lastAvgLoss
            RS = isNaN(RS) ? 0 : RS
            currentRSI = parseFloat((100 - 100 / (1 + RS)).toFixed(2))
          }
        }
        current = yield currentRSI
      }
    })()

    this.generator.next()

    this.result = []

    values.forEach((tick: any) => {
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = rsi

  nextValue(price: number): number | undefined {
    // @ts-ignore
    return this.generator.next(price).value
  }
}

export function rsi(input: RSIInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new RSI(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
