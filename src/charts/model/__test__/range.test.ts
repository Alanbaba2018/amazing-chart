import Range from '../range';

describe('test range.js', () => {
  test('test correct range', () => {
    const range = new Range(-10, 100);
    expect(range.getMaxValue()).toBe(100);
    expect(range.getMinValue()).toBe(-10);
    expect(range.getInterval()).toBe(110);
    expect(range.contain(-11)).toBeFalsy();
    expect(range.contain(50)).toBeTruthy();
  });
  test('range scaleAroundCenter', () => {
    const range = new Range(0, 100);
    range.scaleAroundCenter(0.5);
    expect(range.getMinValue()).toBe(25);
    expect(range.getMaxValue()).toBe(75);
  });
  test('range shift', () => {
    const range = new Range(0, 100);
    range.shift(20);
    expect(range.getMinValue()).toBe(20);
    expect(range.getMaxValue()).toBe(120);
  });
  test('range scaleAroundPoint', () => {
    const range = new Range(10, 100);
    range.scaleAroundPoint(50, 0.5);
    expect(range.getMinValue()).toBe(30);
    expect(range.getMaxValue()).toBe(75);
  });
})