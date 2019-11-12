import { Point } from '../typeof/type'
import Vector2 from '../math/vector2'

enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Right = 'RIGHT',
  Left = 'LEFT',
}

export default class GraphHelper {
  static Arrow_Len: number = 10

  static Arrow_Offset: number = 5

  /**
   *            p1-
   *-----p3--------p2---p0
   *             p4-
   * @param pt position
   * @param direction direction
   */
  static createArrowData(pt: Point, dir: Direction = Direction.Right): Point[] {
    const arrowPoint = new Vector2(pt.x - this.Arrow_Offset, pt.y)
    const direction = new Vector2(0, 1).rotate(120)
    const p0 = new Vector2(0, 0)
    const p1 = p0.clone().add(direction.clone().scale(GraphHelper.Arrow_Len))
    const p2 = p0.clone().substract(new Vector2(GraphHelper.Arrow_Len / 2, 0))
    const p3 = p2.clone().substract(new Vector2(GraphHelper.Arrow_Len, 0))
    const p4 = new Vector2(p1.x, -p1.y)
    if (dir === Direction.Right) {
      return [p2, p1, p0, p4, p2, p3].map(vec =>
        vec
          .clone()
          .add(arrowPoint)
          .toXY(),
      )
    }
    return [p2, p1, p0, p4, p2, p3].map(vec =>
      vec
        .clone()
        .rotate(180)
        .add(arrowPoint)
        .toXY(),
    )
  }
}
