/**
 * Created by AAravindan on 5/17/16.
 */
import { Indicator, IndicatorInput } from '../indicator'
import { CandleData } from '../StockData'
import { TypicalPrice } from '../chart_types/TypicalPrice'
import FixedSizeLinkedList from '../Utils/FixedSizeLinkedList'

export class MFIInput extends IndicatorInput {
  high: number[]

  low: number[]

  close: number[]

  volume: number[]

  period: number
}

export class MFI extends Indicator {
  generator: IterableIterator<number | undefined>

  constructor(input: MFIInput) {
    super(input)
    let highs = input.high
    let lows = input.low
    let closes = input.close
    let volumes = input.volume
    let { period } = input

    let typicalPrice = new TypicalPrice({ low: [], high: [], close: [] })

    let positiveFlow = new FixedSizeLinkedList(period, false, false, true)
    let negativeFlow = new FixedSizeLinkedList(period, false, false, true)

    if (!(lows.length === highs.length && highs.length === closes.length && highs.length === volumes.length)) {
      throw new Error('Inputs(low,high, close, volumes) not of equal size')
    }

    this.result = []

    this.generator = (function* g() {
      let result
      let tick
      let positiveFlowForPeriod
      let rawMoneyFlow = 0
      let moneyFlowRatio
      let negativeFlowForPeriod
      let typicalPriceValue = null
      let prevousTypicalPrice = null
      tick = yield
      tick = yield
      while (true) {
        let { high, low, close, volume } = tick
        let positionMoney = 0
        let negativeMoney = 0
        // @ts-ignore
        typicalPriceValue = typicalPrice.nextValue({ high, low, close })
        // @ts-ignore
        rawMoneyFlow = typicalPriceValue * volume
        if (typicalPriceValue !== null && prevousTypicalPrice !== null) {
          typicalPriceValue > prevousTypicalPrice ? (positionMoney = rawMoneyFlow) : (negativeMoney = rawMoneyFlow)
          positiveFlow.push(positionMoney)
          negativeFlow.push(negativeMoney)
          positiveFlowForPeriod = positiveFlow.periodSum
          negativeFlowForPeriod = negativeFlow.periodSum
          if (positiveFlow.totalPushed >= period && positiveFlow.totalPushed >= period) {
            moneyFlowRatio = positiveFlowForPeriod / negativeFlowForPeriod
            result = 100 - 100 / (1 + moneyFlowRatio)
          }
        }
        prevousTypicalPrice = typicalPriceValue
        tick = yield result
      }
    })()

    this.generator.next()

    highs.forEach((tickHigh, index) => {
      let tickInput = {
        high: tickHigh,
        low: lows[index],
        close: closes[index],
        volume: volumes[index],
      }
      // @ts-ignore
      let result = this.generator.next(tickInput)
      if (result.value !== undefined) {
        this.result.push(parseFloat(result.value.toFixed(2)))
      }
    })
  }

  static calculate = mfi

  // @ts-ignore
  nextValue(price: CandleData): number | undefined {
    // @ts-ignore
    let result = this.generator.next(price)
    if (result.value !== undefined) {
      return parseFloat(result.value.toFixed(2))
    }
  }
}

export function mfi(input: MFIInput): number[] {
  Indicator.reverseInputs(input)
  let { result } = new MFI(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
