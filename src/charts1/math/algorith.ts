import Constant from './constant'
import { XY, Vertex } from './typeof'
import Vector2 from './vector2'
import Operation from './operation'
import Bound from './bound'

export default class Base {
  public static isZero(n: number, tolerance?: number): boolean {
    return typeof tolerance !== 'undefined' ? Math.abs(n) <= Math.abs(tolerance) : Math.abs(n) <= Constant.Zero
  }

  public static isSamePoint(pt1: any, pt2: any): boolean {
    const p1: Vertex = Array.isArray(pt1) ? pt1 : [pt1.x, pt1.y]
    const p2: Vertex = Array.isArray(pt2) ? pt2 : [pt2.x, pt2.y]
    return this.isZero(p1[0] - p2[0]) && this.isZero(p1[1] - p2[1])
  }

  public static getDistance(p1: Vertex, p2: Vertex): number {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)
  }

  public static getSquareDistance(pt1: XY, pt2: XY): number {
    return (pt1.x - pt2.x) ** 2 + (pt1.y - pt2.y) ** 2
  }

  public static transformPointToArray(pt: any): Vertex {
    return Array.isArray(pt) ? pt : [pt.x, pt.y]
  }

  public static transformPointToXY(pt: any): XY {
    return Array.isArray(pt) ? { x: pt[0], y: pt[1] } : pt
  }

  public static transformPointsToArray(pts: XY[]): Vertex[] {
    return pts.map(pt => this.transformPointToArray(pt))
  }

  public static transformPointsToXY(pts: Vertex[]): XY[] {
    return pts.map(pt => this.transformPointToXY(pt))
  }

  /**
   * 返回点集的Bound
   * @param pts 点集
   */
  public static getBoundOfPoints(pts: Vertex[]): Bound {
    const xs: number[] = pts.map(pt => pt[0])
    const ys: number[] = pts.map(pt => pt[1])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    return new Bound(minX, minY, Math.abs(maxX - minX), Math.abs(maxY - minY))
  }

  /**
   * 返回p1到p2的向量
   * @param p1 点p1
   * @param p2 点p2
   */
  public static getDirectionVec(p1: Vertex, p2: Vertex): Vector2 {
    return new Vector2(p2[0] - p1[0], p2[1] - p1[1])
  }

  public static isLeftOfLine(pt: Vertex, v1: Vertex, v2: Vertex): boolean {
    let [bottomPt, topPt] = [new Vector2(v1[0], v1[1]), new Vector2(v2[0], v2[1])]
    if (bottomPt.y > topPt.y) {
      ;[bottomPt, topPt] = [topPt, bottomPt]
    }
    const base: Vector2 = new Vector2(topPt.x - bottomPt.x, topPt.y - bottomPt.y)
    const comVec: Vector2 = new Vector2(pt[0] - bottomPt.x, pt[1] - bottomPt.y)
    return Operation.getCrossMultiply(base, comVec) > 0
  }

  /**
   * 判断向量vec1、vec2是否在基准向量base的两侧
   * @param {Vector2} base
   * @param {Vector2} vec1
   * @param {Vector2} vec2
   */
  public static isBothSide(base: Vector2, vec1: Vector2, vec2: Vector2, tolerance: number = 0): boolean {
    return Operation.getCrossMultiply(base, vec1) * Operation.getCrossMultiply(base, vec2) < tolerance
  }
}
