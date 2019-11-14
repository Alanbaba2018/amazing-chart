import { MAInput } from './SMA'
import { Indicator } from '../indicator'

//STEP3. Add class based syntax with export
export class WilderSmoothing extends Indicator {
  period: number
  price: number[]
  result: number[]
  generator: IterableIterator<number | undefined>
  constructor(input: MAInput) {
    super(input)
    this.period = input.period
    this.price = input.values
    var genFn = function*(period: number): IterableIterator<number | undefined> {
      var sum = 0
      var counter = 1
      var current: any = yield
      var result: any = 0
      while (true) {
        if (counter < period) {
          counter++
          sum = sum + current
          result = undefined
        } else if (counter == period) {
          counter++
          sum = sum + current
          result = sum
        } else {
          result = result - result / period + current
        }
        current = yield result
      }
    }
    this.generator = genFn(this.period)
    this.generator.next()
    this.result = []
    this.price.forEach(tick => {
      //@ts-ignore
      var result = this.generator.next(tick)
      if (result.value != undefined) {
        this.result.push(this.format(result.value))
      }
    })
  }

  static calculate = wildersmoothing

  //@ts-ignore
  nextValue(price: number): number | undefined {
    //@ts-ignore
    var result = this.generator.next(price).value
    if (result != undefined) return this.format(result)
  }
}

export function wildersmoothing(input: MAInput): number[] {
  Indicator.reverseInputs(input)
  var result = new WilderSmoothing(input).result
  if (input.reversedInput) {
    result.reverse()
  }
  Indicator.reverseInputs(input)
  return result
}

//STEP 6. Run the tests
