//// Animator -- an application for program-generated drawings.

import builtins
import data
import drawing
import editor
import errors
import examples
import gleam/dynamic/decode
import gleam/float
import gleam/int
import gleam/json
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

const default_drawing = "Default"

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
    // The speed slider's playback rate: 1.0 is normal speed.
    speed: Float,
    // Whether the pause button is engaged. While True the canvas rate is 0.0,
    // but `speed` is kept so resuming restores the slider's rate.
    paused: Bool,
    // Whether the animation has reached the end of its last path. Reported by
    // the canvas (see render.on_finished_change); the pause button becomes a
    // replay button while this is True.
    finished: Bool,
    // Name shown as selected in the drawing drop-down.
    selected_drawing: String,
    // Named drawings (name, source), kept in sync with localStorage.
    drawings: List(#(String, String)),
  )
}

pub type Msg {
  SetCode(String)
  SetShapeSlider(Int)
  SetSpeed(Float)
  TogglePause
  SetFinished(Bool)
  Replay
  SelectDrawing(String)

  // Layout controls
  ToggleCode
}

const default_shape_slider = 10

const default_speed = 1.0

const library_key = "animator-drawings"

const selected_key = "animator-selected"

// Default starter code plus the named templates from examples.gleam.
fn default_library() -> List(#(String, String)) {
  [#(default_drawing, default_code), ..examples.all]
}

fn encode_library(drawings: List(#(String, String))) -> String {
  json.array(drawings, fn(entry) {
    let #(name, source) = entry
    json.preprocessed_array([json.string(name), json.string(source)])
  })
  |> json.to_string
}

fn decode_library(raw: String) -> Result(List(#(String, String)), Nil) {
  let decoder = {
    use pairs <- decode.then(decode.list(decode.list(decode.string)))
    decode.success(
      list.filter_map(pairs, fn(pair) {
        case pair {
          [name, source] -> Ok(#(name, source))
          _ -> Error(Nil)
        }
      }),
    )
  }
  case json.parse(from: raw, using: decoder) {
    Ok([]) -> Error(Nil)
    Ok(drawings) -> Ok(drawings)
    Error(_) -> Error(Nil)
  }
}

fn save_library(drawings: List(#(String, String))) -> Nil {
  data.storage_set(library_key, encode_library(drawings))
}

fn save_selected(name: String) -> Nil {
  data.storage_set(selected_key, name)
}

fn load_library() -> List(#(String, String)) {
  case data.storage_get(library_key) {
    Ok(raw) ->
      case decode_library(raw) {
        Ok(drawings) -> drawings
        Error(Nil) -> {
          let drawings = default_library()
          save_library(drawings)
          drawings
        }
      }
    Error(Nil) -> {
      let drawings = default_library()
      save_library(drawings)
      drawings
    }
  }
}

fn source_for_drawing(
  drawings: List(#(String, String)),
  name: String,
) -> Result(String, Nil) {
  list.find_map(drawings, fn(entry) {
    let #(n, source) = entry
    case n == name {
      True -> Ok(source)
      False -> Error(Nil)
    }
  })
}

fn load_selected(drawings: List(#(String, String))) -> String {
  let fallback = case drawings {
    [#(name, _), ..] -> name
    [] -> default_drawing
  }
  case data.storage_get(selected_key) {
    Ok(name) ->
      case source_for_drawing(drawings, name) {
        Ok(_) -> name
        Error(Nil) -> fallback
      }
    Error(Nil) -> fallback
  }
}

fn update_drawing_source(
  drawings: List(#(String, String)),
  name: String,
  source: String,
) -> List(#(String, String)) {
  case list.any(drawings, fn(entry) { entry.0 == name }) {
    True ->
      list.map(drawings, fn(entry) {
        let #(n, _) = entry
        case n == name {
          True -> #(n, source)
          False -> entry
        }
      })
    False -> list.append(drawings, [#(name, source)])
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────

pub fn init(_flags: Nil) -> #(Model, Effect(Msg)) {
  let drawings = load_library()
  let selected = load_selected(drawings)
  let source = case source_for_drawing(drawings, selected) {
    Ok(s) -> s
    Error(Nil) -> default_code
  }
  #(
    Model(
      source: source,
      code_open: True,
      output: "",
      shape_slider: default_shape_slider,
      speed: default_speed,
      paused: False,
      finished: False,
      selected_drawing: selected,
      drawings: drawings,
    ),
    // Effects that happen automatically at the start go here.
    effect.batch([
      // Registered first so the canvas can report finishing from the start.
      effect.from(fn(dispatch) {
        render.on_finished_change(fn(finished) {
          dispatch(SetFinished(finished))
        })
      }),
      editor.mount(source, SetCode),
      effect.from(fn(dispatch) { dispatch(SetCode(source)) }),
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
      push_drawing(paths, effective_rate(model), reset),
    )
    Error(msg) -> #(
      Model(..model, output: msg, source: source, shape_slider: shape_slider),
      effect.none(),
    )
  }
}

/// The rate the canvas should actually run at: 0.0 while paused, otherwise the
/// speed slider's value.
fn effective_rate(model: Model) -> Float {
  case model.paused {
    True -> 0.0
    False -> model.speed
  }
}

fn set_canvas_speed(rate: Float) -> Effect(Msg) {
  effect.from(fn(_) { render.set_speed(rate) })
}

// Moving the speed slider while paused remembers the new speed but stays paused.
fn apply_speed(model: Model, speed: Float) -> #(Model, Effect(Msg)) {
  let model = Model(..model, speed: speed)
  #(model, set_canvas_speed(effective_rate(model)))
}

fn apply_pause(model: Model) -> #(Model, Effect(Msg)) {
  let model = Model(..model, paused: !model.paused)
  #(model, set_canvas_speed(effective_rate(model)))
}

// Play the finished animation again from the start. This also unpauses, and
// restores the default speed if the speed slider was at 0, since the replay
// wouldn't move otherwise. Negative speeds still move (backward), so keep them.
fn apply_replay(model: Model) -> #(Model, Effect(Msg)) {
  let speed = case model.speed == 0.0 {
    True -> default_speed
    False -> model.speed
  }
  let model = Model(..model, paused: False, speed: speed)
  #(
    model,
    effect.from(fn(_) {
      render.set_speed(effective_rate(model))
      render.reset_clock()
    }),
  )
}

// Replace the editor and animation with a named drawing from the library.
fn apply_select_drawing(model: Model, name: String) -> #(Model, Effect(Msg)) {
  case source_for_drawing(model.drawings, name) {
    Error(Nil) -> #(model, effect.none())
    Ok(source) -> {
      save_selected(name)
      let model = Model(..model, selected_drawing: name)
      let #(model, draw_effect) =
        apply_drawing(model, source, model.shape_slider, True)
      #(model, effect.batch([editor.mount(source, SetCode), draw_effect]))
    }
  }
}

// Persist the current editor text under the selected drawing name.
fn apply_set_code(model: Model, text: String) -> #(Model, Effect(Msg)) {
  let drawings =
    update_drawing_source(model.drawings, model.selected_drawing, text)
  save_library(drawings)
  apply_drawing(
    Model(..model, drawings: drawings),
    text,
    model.shape_slider,
    !model.paused,
  )
}

// ── Update ─────────────────────────────────────────────────────────────────────

pub fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ToggleCode -> #(Model(..model, code_open: !model.code_open), effect.none())

    // After each keystroke in the editor, evaluate user code and animate (or
    // report errors). Broken code leaves the previous drawing on the canvas.
    // While paused the clock is kept, so the edited drawing shows at the same
    // moment instead of the canvas going blank. Edits are written back into
    // the library and localStorage under the selected drawing.
    SetCode(text) -> apply_set_code(model, text)

    // Re-run draw at the new slider value; keep the clock so a finished
    // drawing updates in place instead of replaying from empty.
    SetShapeSlider(value) -> apply_drawing(model, model.source, value, False)

    // Only the playback rate changes; geometry and clock stay put.
    SetSpeed(speed) -> apply_speed(model, speed)

    // Pause or resume; the clock stays where it is.
    TogglePause -> apply_pause(model)

    // Reported by the canvas when the animation finishes or stops being finished.
    SetFinished(finished) -> #(
      Model(..model, finished: finished),
      effect.none(),
    )

    Replay -> apply_replay(model)

    SelectDrawing(name) -> apply_select_drawing(model, name)
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
      editor.view_panel(ToggleCode, view_drawing_select(model)),
    ]),
    view_anim(model),
  ])
}

fn view_drawing_select(model: Model) -> Element(Msg) {
  html.select(
    [
      attr.class("drawing-select"),
      attr.attribute("data-test-id", "drawing-select"),
      event.on_input(SelectDrawing),
    ],
    list.map(model.drawings, fn(entry) {
      let #(name, _) = entry
      html.option(
        [attr.value(name), attr.selected(name == model.selected_drawing)],
        name,
      )
    }),
  )
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
    view_pause_button(model),
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

/// Speed UI is 0..300 in steps of 100 → whole rates -1, 0, 1, 2.
/// Slider 0 is reverse (-1); 200 is normal (1); 300 is 2×.
fn view_speed_slider(model: Model) -> Element(Msg) {
  let rate = float.round(model.speed)
  let position = { rate + 1 } * 100
  html.label([attr.class("control")], [
    html.span([attr.class("control-label")], [html.text("speed")]),
    html.input([
      attr.type_("range"),
      attr.min("0"),
      attr.max("300"),
      attr.step("100"),
      attr.value(int.to_string(position)),
      attr.attribute("data-test-id", "speed-slider"),
      event.on_input(fn(v) {
        SetSpeed(case int.parse(v) {
          Ok(n) -> int.to_float(n / 100 - 1)
          Error(_) -> model.speed
        })
      }),
    ]),
    html.span([attr.class("control-value")], [
      html.text(int.to_string(rate)),
    ]),
  ])
}

// Play/pause toggle shown above the sliders. It shows the action a click will
// perform: ⏸ while playing, ▶ while paused, and ↻ (replay) once the animation
// has finished.
fn view_pause_button(model: Model) -> Element(Msg) {
  let #(icon, label, msg) = case model.finished, model.paused {
    True, _ -> #("↻", "Replay", Replay)
    False, True -> #("▶", "Play", TogglePause)
    False, False -> #("⏸", "Pause", TogglePause)
  }
  html.button(
    [
      attr.class("icon-btn pause-button"),
      attr.attribute("title", label),
      attr.attribute("aria-label", label),
      attr.attribute("data-test-id", "pause-button"),
      event.on_click(msg),
    ],
    [html.text(icon)],
  )
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
