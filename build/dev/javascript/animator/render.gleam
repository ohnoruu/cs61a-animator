//// Convert each shape into a list of points called a RenderPath.

import gleam/int
import gleam/list
import shape.{type Path, type Point, Line, Point, Quad}

/// One path as canvas.mjs setDrawing consumes it (field by field): the
/// polyline, stroke colour/width, and the start and end times (in tenths of a second)
/// between which the reveal runs — so the renderer's clock needs no shape
/// knowledge.
pub type RenderPath {
  RenderPath(
    points: List(Point),
    thickness: Float,
    color: String,
    start: Float,
    end: Float,
  )
}

// ── The canvas (canvas.mjs) ───────────────────────────────────────────────────

/// Replace the drawing being animated in the page's
/// `<canvas id="animation-canvas">` element. If that element doesn't appear within
/// about 10 seconds, this logs an error to the browser console. This keeps the
/// current time, so a drawing that replaces a finished one appears complete. To
/// animate it from the start, also call reset_clock.
@external(javascript, "./canvas.mjs", "setDrawing")
pub fn set_drawing(paths: List(RenderPath)) -> Nil

/// Set the animation's speed, as a multiple of its normal speed: 1.0 is normal and
/// is where it starts, 0.0 pauses, and a negative rate plays it backward.
/// Time stops at the start of the drawing and when its last path finishes, so
/// playing a finished drawing again takes a call to reset_clock.
@external(javascript, "./canvas.mjs", "setSpeed")
pub fn set_speed(rate: Float) -> Nil

/// Jump the animation back to its start, where the canvas is empty.
@external(javascript, "./canvas.mjs", "resetClock")
pub fn reset_clock() -> Nil

/// Register a callback that the canvas calls with True when the animation
/// finishes (time reaches the end of the last path) and with False when it stops
/// being finished (after reset_clock, or when the drawing becomes longer).
@external(javascript, "./canvas.mjs", "setOnFinishedChange")
pub fn on_finished_change(callback: fn(Bool) -> Nil) -> Nil

/// How many segments to use when flattening a Quad into a polyline.
const quad_segments = 24

pub fn render_path(path: Path) -> RenderPath {
  let points = case path.shape {
    Line(a, b) -> [a, b]
    Quad(a, c, b) -> sample_quad(a, c, b, quad_segments)
  }
  RenderPath(points, path.thickness, path.color, path.start, path.end)
}

/// Sample a quadratic Bézier at t = 0, 1/n, ..., 1.
fn sample_quad(a: Point, c: Point, b: Point, n: Int) -> List(Point) {
  sample_quad_loop(a, c, b, n, 0, [])
}

fn sample_quad_loop(
  a: Point,
  c: Point,
  b: Point,
  n: Int,
  i: Int,
  acc: List(Point),
) -> List(Point) {
  case i > n {
    True -> list.reverse(acc)
    False -> {
      let t = int.to_float(i) /. int.to_float(n)
      sample_quad_loop(a, c, b, n, i + 1, [quad_at(a, c, b, t), ..acc])
    }
  }
}

/// Point on the quadratic Bézier: (1-t)²A + 2(1-t)tC + t²B.
fn quad_at(a: Point, c: Point, b: Point, t: Float) -> Point {
  let u = 1.0 -. t
  let uu = u *. u
  let tt = t *. t
  let ut2 = 2.0 *. u *. t
  Point(
    uu *. a.x +. ut2 *. c.x +. tt *. b.x,
    uu *. a.y +. ut2 *. c.y +. tt *. b.y,
  )
}
