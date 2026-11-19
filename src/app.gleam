//// Animator -- an application for program-generated drawings.

import builtins
import drawing
import editor
import errors
import gleam/float
import gleam/int
import gleam/list
import gleam/result
import lustre
import lustre/attribute as attr
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import lustre/event
import parser
import render
import shape.{type Path}

/// Your app's public address, once you've deployed it in Problem 13, such as
/// "https://your-username.github.io/animator/".
pub const public_url = ""

/// Set to True if you would like your app's URL included in the course gallery.
pub const include_app_in_gallery = False

/// A link to your video from Problem 14, which anyone with the link can watch.
pub const video_url = ""

/// Set to True if you would like your video included in the course gallery.
pub const include_video_in_gallery = False

const default_code =
  "fn draw(shape_slider: Int) -> List(Path) {\n  [\n    Path(Line(Point(0, 0), Point(100, 100)), 0, 10, 2),    \n]\n}\n"

// ── Model ──────────────────────────────────────────────────────────────────────

pub type Model {
  Model(
    // The code in the editor.
    source: String,
    // Whether the code editor is shown.
    code_open: Bool,
    output: String,
    // Value passed to draw as shape_slider, in [0, 100].
    shape_slider: Int,
    // Playback rate passed to set_speed: 1.0 normal, 0.0 paused.
    speed: Float,
    paused: Bool
  )
}

pub type Msg {
  SetCode(String)
  SetShapeSlider(Int)
  SetSpeed(Float)
  TogglePause(Bool)

  // Layout controls
  ToggleCode
}

const default_shape_slider = 10

const default_speed = 1.0

// ── Init ───────────────────────────────────────────────────────────────────────

pub fn init(_flags: Nil) -> #(Model, Effect(Msg)) {
  #(
    Model(
      source: "",
      code_open: True,
      output: "",
      shape_slider: default_shape_slider,
      speed: default_speed,
    ),
    // Effects that happen automatically at the start go here.
    effect.batch([
      editor.mount(default_code, SetCode),
      effect.from(fn(dispatch) { dispatch(SetCode(default_code)) }),
    ]),
  )
}

// Parse and evaluate a draw function at the given shape-slider value, returning
// the rendered paths on success, or a human-readable message on failure.
fn run_source(shape_slider: Int, source: String) -> Result(List(Path), String) {
  case parser.parse_program(source, builtins.global_frame()) {
    Error(msg) -> Error(msg)
    Ok(program) ->
      drawing.try_draw(shape_slider, program)
      // Convert Error(EvalError) to Error(String) with a useful error message.
      |> result.map_error(errors.error_message)
  }
}

/// Convert Paths to RenderPaths and push them to the page canvas.
/// When reset is True, the reveal restarts from time 0 (used on code edits).
/// When False, the clock is kept so a finished drawing stays complete while
/// the shape slider morphs the geometry.
fn push_drawing(paths: List(Path), speed: Float, reset: Bool) -> Effect(Msg) {
  effect.from(fn(_) {
    let strokes = list.map(paths, render.render_path)
    render.set_speed(speed)
    render.set_drawing(strokes)
    case reset {
      True -> render.reset_clock()
      False -> Nil
    }
  })
}

fn apply_drawing(
  model: Model,
  source: String,
  shape_slider: Int,
  reset: Bool,
) -> #(Model, Effect(Msg)) {
  case run_source(shape_slider, source) {
    Ok(paths) -> #(
      Model(..model, output: "", source: source, shape_slider: shape_slider),
      push_drawing(paths, model.speed, reset),
    )
    Error(msg) -> #(
      Model(..model, output: msg, source: source, shape_slider: shape_slider),
      effect.none(),
    )
  }
}

fn set_canvas_speed(rate: Float) -> Effect(Msg) {
  effect.from(fn(_) { render.set_speed(speed)})
}

fn apply_speed(model: Model, speed: Float) -> #(Model, Effect(Msg)) {
  #(
    Model(..model, speed: speed),
    effect.from(fn(_) { render.set_speed(speed) }),
  )
}

// ── Update ─────────────────────────────────────────────────────────────────────

pub fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ToggleCode -> #(Model(..model, code_open: !model.code_open), effect.none())

    // After each keystroke in the editor, evaluate user code and animate (or
    // report errors). Broken code leaves the previous drawing on the canvas.
    SetCode(text) -> apply_drawing(model, text, model.shape_slider, True)

    // Re-run draw at the new slider value; keep the clock so a finished
    // drawing updates in place instead of replaying from empty.
    SetShapeSlider(value) -> apply_drawing(model, model.source, value, False)

    // Only the playback rate changes; geometry and clock stay put.
    SetSpeed(speed) -> apply_speed(model, speed)
    TogglePause -> 
      case model.paused {
        False -> #(
          Model(..model, paused: True),
          
        )
      }
  }
}

// ── View ──────────────────────────────────────────────────────────────────
//
// Two side-by-side panes: the code editor on the left and its rendered output on
// the right. The code column can be hidden to expand the right pane.

pub fn view(model: Model) -> Element(Msg) {
  let app_class = case model.code_open {
    True -> "app"
    False -> "app code-hidden"
  }
  // The code column still exists even when hidden (CSS collapses it) so the
  // mounted CodeMirror editor keeps its state across show/hide.
  html.div([attr.class(app_class)], [
    html.div([attr.class("code-col")], [
      editor.view_panel(ToggleCode),
    ]),
    view_anim(model),
  ])
}

fn view_anim(model: Model) -> Element(Msg) {
  html.div([attr.class("canvas-area")], [
    view_reveal_code(model),
    html.canvas([attr.id("animation-canvas"), attr.class("canvas")]),
    view_controls(model),
    case model.output {
      "" -> element.none()
      msg -> html.pre([attr.class("output")], [html.text(msg)])
    },
  ])
}

fn view_controls(model: Model) -> Element(Msg) {
  html.div([attr.class("canvas-controls")], [
    view_shape_slider(model),
    view_speed_slider(model),
  ])
}

fn view_shape_slider(model: Model) -> Element(Msg) {
  html.label([attr.class("control")], [
    html.span([attr.class("control-label")], [html.text("shape")]),
    html.input([
      attr.type_("range"),
      attr.min("0"),
      attr.max("100"),
      attr.value(int.to_string(model.shape_slider)),
      attr.attribute("data-test-id", "shape-slider"),
      event.on_input(fn(v) {
        SetShapeSlider(result.unwrap(int.parse(v), model.shape_slider))
      }),
    ]),
    html.span([attr.class("control-value")], [
      html.text(int.to_string(model.shape_slider)),
    ]),
  ])
}

/// Speed UI is 0..300 hundredths of normal rate → 0.0 (pause) .. 3.0.
fn view_speed_slider(model: Model) -> Element(Msg) {
  let hundredths = float.round(model.speed *. 100.0)
  html.label([attr.class("control")], [
    html.span([attr.class("control-label")], [html.text("speed")]),
    html.input([
      attr.type_("range"),
      attr.min("0"),
      attr.max("300"),
      attr.value(int.to_string(hundredths)),
      attr.attribute("data-test-id", "speed-slider"),
      event.on_input(fn(v) {
        SetSpeed(case int.parse(v) {
          Ok(n) -> int.to_float(n) /. 100.0
          Error(_) -> model.speed
        })
      }),
    ]),
    html.span([attr.class("control-value")], [
      html.text(float.to_string(model.speed)),
    ]),
  ])

  fn pause_button() -> Element(Msg) {
    html.button(
      [
        attr.class("pause-button")
        event.on_click
      ]
    )
  }
}

// The button that brings the code column back, overlaid on the top-left of the
// right pane. Nothing is rendered while the column is already showing (its own
// header holds the button that hides it).
fn view_reveal_code(model: Model) -> Element(Msg) {
  case model.code_open {
    True -> element.none()
    False ->
      html.button(
        [
          attr.class("icon-btn reveal-code"),
          attr.attribute("title", "Show code"),
          event.on_click(ToggleCode),
        ],
        [html.text("⟩")],
      )
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

pub fn main() -> Nil {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}
