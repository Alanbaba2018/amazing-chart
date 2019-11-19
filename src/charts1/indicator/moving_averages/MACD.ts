/**
 * Created by AAravindan on 5/4/16.
 */
import { Indicator, IndicatorInput } from '../indicator'
import { SMA } from './SMA'
import { EMA } from './EMA'

export class MACDInput extends IndicatorInput {
  SimpleMAOscillator?: boolean = true

  SimpleMASignal?: boolean = true

  fastPeriod: number

  slowPeriod: number

  signalPeriod: number

  constructor(public values: number[]) {
    super()
  }
}

export class MACDOutput {
  MACD?: number

  signal?: number

  histogram?: number
}

export class MACD extends Indicator {
  result: MACDOutput[]

  generator: IterableIterator<MACDOutput | undefined>

  constructor(input: MACDInput) {
    super(input)
    const OscillatorMAtype = input.SimpleMAOscillator ? SMA : EMA
    const SignalMAtype = input.SimpleMASignal ? SMA : EMA
    let fastMAProducer = new OscillatorMAtype({
      period: input.fastPeriod,
      values: [],
    })
    let slowMAProducer = new OscillatorMAtype({
      period: input.slowPeriod,
      values: [],
    })
    let signalMAProducer = new SignalMAtype({
      period: input.signalPeriod,
      values: [],
    })
    this.result = []

    this.generator = (function* g() {
      let index = 0
      let tick
      let macd: number | undefined
      let signal: number | undefined
      let histogram: number | undefined
      let fast: number | undefined
      let slow: number | undefined
      while (true) {
        if (index < input.slowPeriod) {
          tick = yield
          fast = fastMAProducer.nextValue(tick)
          slow = slowMAProducer.nextValue(tick)
          index++
        } else {
          if (fast && slow) {
            macd = fast - slow
            signal = signalMAProducer.nextValue(macd)
          }
          // @ts-ignore
          histogram = macd - signal
          // eslint-disable-next-line
          tick = yield {
            MACD: macd,
            signal,
            histogram: histogram || undefined,
          }
          fast = fastMAProducer.nextValue(tick)
          slow = slowMAProducer.nextValue(tick)
        }
      }
    })()

    this.generator.next()

    input.values.forEach(tick => {
      // @ts-ignore
      let result = this.generator.next(tick)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = (input: MACDInput): MACDOutput[] => {
    Indicator.reverseInputs(input)
    let { result } = new MACD(input)
    if (input.reversedInput) {
      result.reverse()
    }
    Indicator.reverseInputs(input)
    return result
  }

  nextValue(price: number): MACDOutput | undefined {
    // @ts-ignore
    let result = this.generator.next(price).value
    return result
  }
}
