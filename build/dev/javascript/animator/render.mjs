//# sourceMappingURL=render.mjs.map
import * as $int from "../gleam_stdlib/gleam/int.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import {
  setDrawing as set_drawing,
  setSpeed as set_speed,
  resetClock as reset_clock,
  setOnFinishedChange as on_finished_change,
} from "./canvas.mjs";
import {
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideFloat,
} from "./gleam.mjs";
import * as $shape from "./shape.mjs";
import { Line, Point, Quad } from "./shape.mjs";

export { on_finished_change, reset_clock, set_drawing, set_speed };

export class RenderPath extends $CustomType {
  constructor(points, thickness, color, start, end) {
    super();
    this.points = points;
    this.thickness = thickness;
    this.color = color;
    this.start = start;
    this.end = end;
  }
}
export const RenderPath$RenderPath = (points, thickness, color, start, end) =>
  new RenderPath(points, thickness, color, start, end);
export const RenderPath$isRenderPath = (value) => value instanceof RenderPath;
export const RenderPath$RenderPath$points = (value) => value.points;
export const RenderPath$RenderPath$0 = (value) => value.points;
export const RenderPath$RenderPath$thickness = (value) => value.thickness;
export const RenderPath$RenderPath$1 = (value) => value.thickness;
export const RenderPath$RenderPath$color = (value) => value.color;
export const RenderPath$RenderPath$2 = (value) => value.color;
export const RenderPath$RenderPath$start = (value) => value.start;
export const RenderPath$RenderPath$3 = (value) => value.start;
export const RenderPath$RenderPath$end = (value) => value.end;
export const RenderPath$RenderPath$4 = (value) => value.end;

/**
 * How many segments to use when flattening a Quad into a polyline.
 * 
 * @ignore
 */
const quad_segments = 24;

/**
 * Point on the quadratic Bézier: (1-t)²A + 2(1-t)tC + t²B.
 * 
 * @ignore
 */
function quad_at(a, c, b, t) {
  let u = 1.0 - t;
  let uu = u * u;
  let tt = t * t;
  let ut2 = (2.0 * u) * t;
  return new Point(
    ((uu * a.x) + (ut2 * c.x)) + (tt * b.x),
    ((uu * a.y) + (ut2 * c.y)) + (tt * b.y),
  );
}

function sample_quad_loop(loop$a, loop$c, loop$b, loop$n, loop$i, loop$acc) {
  while (true) {
    let a = loop$a;
    let c = loop$c;
    let b = loop$b;
    let n = loop$n;
    let i = loop$i;
    let acc = loop$acc;
    let $ = i > n;
    if ($) {
      return $list.reverse(acc);
    } else {
      let t = divideFloat($int.to_float(i), $int.to_float(n));
      loop$a = a;
      loop$c = c;
      loop$b = b;
      loop$n = n;
      loop$i = i + 1;
      loop$acc = listPrepend(quad_at(a, c, b, t), acc);
    }
  }
}

/**
 * Sample a quadratic Bézier at t = 0, 1/n, ..., 1.
 * 
 * @ignore
 */
function sample_quad(a, c, b, n) {
  return sample_quad_loop(a, c, b, n, 0, $List$Empty$const);
}

export function render_path(path) {
  let _block;
  let $ = path.shape;
  if ($ instanceof Line) {
    let a = $.start;
    let b = $.end;
    _block = listPrepend(a, listPrepend(b, $List$Empty$const));
  } else {
    let a = $.start;
    let c = $.control;
    let b = $.end;
    _block = sample_quad(a, c, b, quad_segments);
  }
  let points = _block;
  return new RenderPath(
    points,
    path.thickness,
    path.color,
    path.start,
    path.end,
  );
}
