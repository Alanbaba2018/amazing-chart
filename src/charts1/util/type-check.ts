export function isString (value: any): boolean {
  return typeof value === 'string'
}

export function isNumber (value: any): boolean {
  return typeof value === 'number' && isFinite(value)
}

export function isInteger (value: any): boolean {
  return typeof value === 'number' && (value % 1 === 0)
}
