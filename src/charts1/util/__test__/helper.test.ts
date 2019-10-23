import { isBothBoundOverlapped, formatTime } from '../helper'

describe('test helper.ts', () => {
  test('two bounds overlap', () => {
    const boundA = { x: 0, y: 0, width: 50, height: 50 }
    const boundB = { x: 20, y: 20, width: 30, height: 60 }
    expect(isBothBoundOverlapped(boundA, boundB)).toBe(true)
  })

  test('two bounds near', () => {
    const boundA = { x: 0, y: 0, width: 50, height: 50 }
    const boundB = { x: 50, y: 20, width: 30, height: 60 }
    expect(isBothBoundOverlapped(boundA, boundB)).toBe(true)
  })

  test('two bounds not overlap', () => {
    const boundA = { x: 0, y: 0, width: 50, height: 50 }
    const boundB = { x: 55, y: 20, width: 30, height: 60 }
    expect(isBothBoundOverlapped(boundA, boundB)).toBe(false)
  })

  test('two bounds contained', () => {
    const boundA = { x: 0, y: 0, width: 50, height: 50 }
    const boundB = { x: 10, y: 10, width: 10, height: 10 }
    expect(isBothBoundOverlapped(boundA, boundB)).toBe(true)
  })

  test('format YYYY-MM-DD hh:mm:ss time', () => {
    const d = new Date(2019, 9, 22).getTime()
    expect(formatTime(d)).toBe('2019-10-22 00:00:00')
  })

  test('format NaN timestamp should give default', () => {
    expect(formatTime(NaN, 'YY-MM-DD')).toBe('YY-MM-DD')
  })

  test('format undefined should give default', () => {
    expect(formatTime(undefined, 'YY-MM-DD')).toBe('YY-MM-DD')
  })
})
