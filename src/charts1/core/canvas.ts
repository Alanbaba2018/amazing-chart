import { Bound, Point } from '../typeof/type'

export default class Canvas {
  static drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
  }

  static drawLines(ctx: CanvasRenderingContext2D, points: Point[]) {
    for (let i = 0; i < points.length; i++) {
      const p: Point = points[i]
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
    }
  }

  static drawBackground(ctx: CanvasRenderingContext2D, color: string = '#FFFFFF', bound?: Bound) {
    if (!bound) {
      bound = {
        x: 0,
        y: 0,
        width: ctx.canvas.width,
        height: ctx.canvas.height,
      }
    }
    ctx.save()
    ctx.fillStyle = color
    ctx.fillRect(bound.x, bound.y, bound.width, bound.height)
    ctx.restore()
  }

  static clearRect(ctx: CanvasRenderingContext2D, bound?: Bound) {
    if (!bound) {
      bound = {
        x: 0,
        y: 0,
        width: ctx.canvas.width,
        height: ctx.canvas.height,
      }
    }
    ctx.clearRect(bound.x, bound.y, bound.width, bound.height)
  }

  static drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color?: string) {
    if (color) {
      ctx.fillStyle = color
    }
    ctx.fillText(text, x, y)
  }

  static strokeRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.strokeRect(x, y, width, height)
  }

  static fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.fillRect(x, y, width, height)
  }

  static fillImage(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement) {
    // Canvas.clearRect(ctx)
    ctx.drawImage(image, 0, 0)
  }
}
