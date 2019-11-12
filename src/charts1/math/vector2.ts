import Operation from './operation'
import { Vertex, XY } from './typeof'

export default class Vector2 {
  public static lerp(vec1: Vector2, vec2: Vector2, lerp: number): Vector2 {
    const dir: Vector2 = new Vector2(vec2.x - vec1.x, vec2.y - vec1.y)
    return vec1.add(dir.scale(lerp))
  }

  public x: number = 0

  public y: number = 0

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public add(vector2: Vector2): Vector2 {
    this.x += Number(vector2.x)
    this.y += Number(vector2.y)
    return this
  }

  public substract(vector2: Vector2): Vector2 {
    this.x -= Number(vector2.x)
    this.y -= Number(vector2.y)
    return this
  }

  public normalize(): Vector2 {
    const dis = this.getModelLength()
    if (dis === 0) {
      return new Vector2(0, 0)
    }
    return new Vector2(this.x / dis, this.y / dis)
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  public rotate(angle: number): Vector2 {
    const rotatedRad: number = Operation.degreeToRadius(angle)
    const x = this.x * Math.cos(rotatedRad) - this.y * Math.sin(rotatedRad)
    const y = this.x * Math.sin(rotatedRad) + this.y * Math.cos(rotatedRad)
    this.x = x
    this.y = y
    return this
  }

  public scale(scale_x: number, scale_y?: number): Vector2 {
    this.x *= scale_x
    this.y *= scale_y || scale_x
    return this
  }

  public getSquareLength(): number {
    return this.x ** 2 + this.y ** 2
  }

  public getModelLength(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  public toArray(): Vertex {
    return [this.x, this.y]
  }

  public toXY(): XY {
    return { x: this.x, y: this.y }
  }
}