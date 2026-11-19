//// Drawing a program: call its draw function on the shape slider's value and
//// convert the list it returns into the Paths the animator renders.
////
//// The user's integers become the Float fields the geometry needs.

import errors.{type EvalError, BadDrawing, PathLimit}
import evaluator.{type GlobalFrame, type Value, VData, VInt, VList, VString}
import gleam/int
import gleam/list
import gleam/result
import limits
import shape.{type Path, type Point, type Shape, Line, Path, Point, Quad}

/// Call the program's draw function on shape_slider, returning its list of
/// paths or the evaluation error, so the app can show failures.
pub fn try_draw(
  shape_slider: Int,
  global: GlobalFrame,
) -> Result(List(Path), EvalError) {
  case evaluator.run("draw", [VInt(shape_slider)], global) {
    Ok(VList(items)) ->
      // The step allowance bounds what evaluation can build, but the
      // renderer redraws every path each frame, so a finished drawing is
      // also capped.
      case list.length(items) > limits.path_limit {
        True -> Error(PathLimit)
        False -> list.try_map(items, to_path)
      }
    Ok(_) -> Error(BadDrawing("return value of draw is not a list"))
    Error(err) -> Error(err)
  }
}

const default_color = "white"

fn to_path(v: Value) -> Result(Path, EvalError) {
  case v {
    // Color omitted (or not yet normalized): default to white.
    VData("Path", [shape, VInt(start), VInt(end), VInt(thickness)]) -> {
      use s <- result.try(to_shape(shape))
      Ok(Path(
        s,
        int.to_float(start),
        int.to_float(end),
        int.to_float(thickness),
        default_color,
      ))
    }
    VData("Path", [shape, VInt(start), VInt(end), VInt(thickness), VString(color)]) -> {
      use s <- result.try(to_shape(shape))
      Ok(Path(
        s,
        int.to_float(start),
        int.to_float(end),
        int.to_float(thickness),
        color,
      ))
    }
    _ -> Error(BadDrawing("some element is not a well-formed path"))
  }
}

fn to_shape(v: Value) -> Result(Shape, EvalError) {
  case v {
    VData("Line", [start, end]) -> {
      use a <- result.try(to_point(start))
      use b <- result.try(to_point(end))
      Ok(Line(a, b))
    }
    VData("Quad", [start, control, end]) -> {
      use a <- result.try(to_point(start))
      use c <- result.try(to_point(control))
      use b <- result.try(to_point(end))
      Ok(Quad(a, c, b))
    }
    _ -> Error(BadDrawing("a Path's shape must be a recognized shape"))
  }
}

fn to_point(v: Value) -> Result(Point, EvalError) {
  case v {
    VData("Point", [VInt(x), VInt(y)]) ->
      Ok(Point(int.to_float(x), int.to_float(y)))
    _ -> Error(BadDrawing("expected a Point"))
  }
}
