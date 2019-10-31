export function isString(value: any): boolean {
  return typeof value === 'string'
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value)
}

export function isInteger(value: any): boolean {
  return typeof value === 'number' && value % 1 === 0
}

export function isObject(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Object]'
}
