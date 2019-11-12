import { Bound, Point } from '../../typeof/type'
import EventHandle from '../eventHandle'

export default abstract class IBound extends EventHandle {
  public bound: Bound = { x: 0, y: 0, width: 0, height: 0 }

  public getBound(): Bound {
    return this.bound
  }

  public setBound(bound: Bound) {
    this.bound = bound
    return this
  }

  public updateBound(key: keyof Bound, value: number) {
    this.bound[key] = value
  }

  public contain(point: Point): boolean {
    return (
      point.x > this.bound.x &&
      point.y < this.bound.y &&
      point.x - this.bound.x < this.bound.width &&
      this.bound.y - point.y < this.bound.height
    )
  }

  public transformPointToView(point: Point): Point {
    return {
      x: point.x - this.bound.x,
      y: this.bound.y - point.y,
    }
  }
}
