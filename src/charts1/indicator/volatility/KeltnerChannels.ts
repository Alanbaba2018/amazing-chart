import { Indicator, IndicatorInput } from '../indicator'
import { SMA } from '../moving_averages/SMA'
import { EMA } from '../moving_averages/EMA'
import { ATR } from '../directionalmovement/ATR'

export class KeltnerChannelsInput extends IndicatorInput {
  maPeriod: number = 20

  atrPeriod: number = 10

  useSMA: boolean = false

  multiplier: number = 1

  high: number[]

  low: number[]

  close: number[]
}

export class KeltnerChannelsOutput extends IndicatorInput {
  middle: number

  upper: number

  lower: number
}

export class KeltnerChannels extends Indicator {
  result: KeltnerChannelsOutput[]

  generator: IterableIterator<KeltnerChannelsOutput | undefined>

  constructor(input: KeltnerChannelsInput) {
    super(input)
    let MaType = input.useSMA ? SMA : EMA
    let maProducer = new MaType({
      period: input.maPeriod,
      values: [],
    })
    let atrProducer = new ATR({
      period: input.atrPeriod,
      high: [],
      low: [],
      close: [],
    })
    let tick
    this.result = []
    this.generator = (function* g() {
      let result
      tick = yield
      while (true) {
        let { close } = tick
        let ma = maProducer.nextValue(close)
        let atr = atrProducer.nextValue(tick)
        if (ma !== undefined && atr !== undefined) {
          result = {
            middle: ma,
            upper: ma + input.multiplier * atr,
            lower: ma - input.multiplier * atr,
          }
        }
        tick = yield result
      }
    })()

    this.generator.next()

    let highs = input.high

    highs.forEach((tickHigh, index) => {
      let tickInput = {
        high: tickHigh,
        low: input.low[index],
        close: input.close[index],
      }
      // @ts-ignore
      let result = this.generator.next(tickInput)
      if (result.value !== undefined) {
        this.result.push(result.value)
      }
    })
  }

  static calculate = keltnerchannels

  // @ts-ignore
  nextValue(price: KeltnerChannelsInput): KeltnerChannelsOutput | undefined {
    // @ts-ignore
    let result = this.generator.next(price)
    if (result.value !== undefined) {
      return result.value
    }
  }
}

export function keltnerchannels(input: KeltnerChannelsInput): KeltnerChannelsOutput[] {
  Indicator.reverseInputs(input)
  let { result } = new KeltnerChannels(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
