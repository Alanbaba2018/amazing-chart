import { WilderSmoothing } from '../moving_averages/WilderSmoothing'
import { Indicator, IndicatorInput } from '../indicator'
import { MDM } from './MinusDM'
import { PDM } from './PlusDM'
import { TrueRange } from './TrueRange'
import { WEMA } from '../moving_averages/WEMA'

export class ADXInput extends IndicatorInput {
  high: number[]

  low: number[]

  close: number[]

  period: number
}

export class ADXOutput extends IndicatorInput {
  adx: number

  pdi: number

  mdi: number
}

export class ADX extends Indicator {
  result: ADXOutput[]

  generator: IterableIterator<ADXOutput | undefined>

  constructor(input: ADXInput) {
    super(input)
    let lows = input.low
    let highs = input.high
    let closes = input.close
    let { period } = input

    let plusDM = new PDM({
      high: [],
      low: [],
    })

    let minusDM = new MDM({
      high: [],
      low: [],
    })

    let emaPDM = new WilderSmoothing({
      period,
      values: [],
      format: v => v,
    })
    let emaMDM = new WilderSmoothing({
      period,
      values: [],
      format: v => v,
    })
    let emaTR = new WilderSmoothing({
      period,
      values: [],
      format: v => v,
    })
    let emaDX = new WEMA({
      period,
      values: [],
      format: v => v,
    })

    let tr = new TrueRange({
      low: [],
      high: [],
      close: [],
    })

    if (!(lows.length === highs.length && highs.length === closes.length)) {
      throw new Error('Inputs(low,high, close) not of equal size')
    }

    this.result = []
    this.generator = (function* g() {
      let tick = yield
      let lastPDI
      let lastMDI
      let lastDX
      let smoothedDX
      while (true) {
        let calcTr = tr.nextValue(tick)
        let calcPDM = plusDM.nextValue(tick)
        let calcMDM = minusDM.nextValue(tick)
        if (calcTr === undefined) {
          tick = yield
        } else {
          let lastATR = emaTR.nextValue(calcTr)
          // @ts-ignore
          let lastAPDM = emaPDM.nextValue(calcPDM)
          // @ts-ignore
          let lastAMDM = emaMDM.nextValue(calcMDM)
          if (lastATR !== undefined && lastAPDM !== undefined && lastAMDM !== undefined) {
            lastPDI = (lastAPDM * 100) / lastATR
            lastMDI = (lastAMDM * 100) / lastATR
            let diDiff = Math.abs(lastPDI - lastMDI)
            let diSum = lastPDI + lastMDI
            lastDX = (diDiff / diSum) * 100
            smoothedDX = emaDX.nextValue(lastDX)
          }
          // eslint-disable-next-line
          tick = yield { adx: smoothedDX, pdi: lastPDI, mdi: lastMDI }
        }
      }
    })()

    this.generator.next()

    // @ts-ignore
    lows.forEach((tick, index) => {
      // @ts-ignore
      let result = this.generator.next({
        high: highs[index],
        low: lows[index],
        close: closes[index],
      })
      if (result.value !== undefined && result.value.adx !== undefined) {
        this.result.push({
          adx: this.format(result.value.adx),
          pdi: this.format(result.value.pdi),
          mdi: this.format(result.value.mdi),
        })
      }
    })
  }

  static calculate = adx

  // @ts-ignore
  nextValue(price: number): ADXOutput | undefined {
    // @ts-ignore
    let result = this.generator.next(price).value
    if (result !== undefined && result.adx !== undefined) {
      return { adx: this.format(result.adx), pdi: this.format(result.pdi), mdi: this.format(result.mdi) }
    }
  }
}

export function adx(input: ADXInput): ADXOutput[] {
  Indicator.reverseInputs(input)
  let { result } = new ADX(input)
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}
