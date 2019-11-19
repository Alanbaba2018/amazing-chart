import { IndicatorInput, Indicator } from '../indicator'

import LinkedList from '../Utils/FixedSizeLinkedList'

export class WilliamsRInput extends IndicatorInput {
  low: number[]

  high: number[]

  close: number[]

  period: number
}

export class WilliamsR extends Indicator {
  result: number[]

  generator: IterableIterator<number | undefined>

  constructor(input: WilliamsRInput) {
    super(input)
    let lows = input.low
    let highs = input.high
    let closes = input.close
    let { period } = input

    if (!(lows.length === highs.length && highs.length === closes.length)) {
      throw new Error('Inputs(low,high, close) not of equal size')
    }
    this.result = []
    this.generator = (function* g(): IterableIterator<number | undefined> {
      let index = 1
      let pastHighPeriods = new LinkedList(period, true, false)
      let pastLowPeriods = new LinkedList(period, false, true)
      let periodLowVal
      let periodHighVal
      let tick: any = yield
      let williamsR
      while (true) {
        pastHighPeriods.push(tick.high)
        pastLowPeriods.push(tick.low)
        if (index < period) {
          index++
          tick = yield
        } else {
          periodLowVal = pastLowPeriods.periodLow
          periodHighVal = pastHighPeriods.periodHigh
          williamsR = ((periodHighVal - tick.close) / (periodHighVal - periodLowVal)) * -100
          tick = yield williamsR
        }
      }
    })()

    this.generator.next()

    // @ts-ignore
    lows.forEach((low, index) => {
      // @ts-ignore
      let result = this.generator.next({
        high: highs[index],
        low: lows[index],
        close: closes[index],
      })
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = (input: WilliamsRInput): number[] => {
    Indicator.reverseInputs(input)
    let { result } = new WilliamsR(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  // @ts-ignore
  nextValue(price: number): number | undefined {
    // @ts-ignore
    let nextResult = this.generator.next(price)
    if (nextResult.value !== undefined) return this.format(nextResult.value)
  }
}
