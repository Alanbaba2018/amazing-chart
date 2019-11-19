export class IndicatorInput {
  reversedInput?: boolean

  format?: (data: number) => number
}

export class AllInputs {
  values?: number[]

  open?: number[]

  high?: number[]

  low?: number[]

  close?: number[]

  volume?: number[]

  timestamp?: number[]
}

export class Indicator {
  result: any

  constructor(input: IndicatorInput) {
    if (input.format) {
      this.format = input.format
    }
  }

  static reverseInputs(input: any): void {
    if (input.reversedInput) {
      input.values && input.values.reverse()
      input.open && input.open.reverse()
      input.high && input.high.reverse()
      input.low && input.low.reverse()
      input.close && input.close.reverse()
      input.volume && input.volume.reverse()
      input.timestamp && input.timestamp.reverse()
    }
  }

  format(data: number): number {
    return data
  }

  getResult() {
    return this.result
  }
}
