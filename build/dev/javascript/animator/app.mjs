//# sourceMappingURL=app.mjs.map
import * as $json from "../gleam_json/gleam/json.mjs";
import * as $decode from "../gleam_stdlib/gleam/dynamic/decode.mjs";
import * as $float from "../gleam_stdlib/gleam/float.mjs";
import * as $int from "../gleam_stdlib/gleam/int.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import * as $result from "../gleam_stdlib/gleam/result.mjs";
import * as $lustre from "../lustre/lustre.mjs";
import * as $attr from "../lustre/lustre/attribute.mjs";
import * as $effect from "../lustre/lustre/effect.mjs";
import * as $element from "../lustre/lustre/element.mjs";
import * as $html from "../lustre/lustre/element/html.mjs";
import * as $event from "../lustre/lustre/event.mjs";
import * as $builtins from "./builtins.mjs";
import * as $data from "./data.mjs";
import * as $drawing from "./drawing.mjs";
import * as $editor from "./editor.mjs";
import * as $errors from "./errors.mjs";
import * as $examples from "./examples.mjs";
import {
  Ok,
  Error,
  Empty as $Empty,
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  makeError,
} from "./gleam.mjs";
import * as $parser from "./parser.mjs";
import * as $render from "./render.mjs";
import * as $shape from "./shape.mjs";

const FILEPATH = "src/app.gleam";

export class Model extends $CustomType {
  constructor(source, code_open, output, shape_slider, speed, paused, finished, selected_drawing, drawings) {
    super();
    this.source = source;
    this.code_open = code_open;
    this.output = output;
    this.shape_slider = shape_slider;
    this.speed = speed;
    this.paused = paused;
    this.finished = finished;
    this.selected_drawing = selected_drawing;
    this.drawings = drawings;
  }
}
export const Model$Model = (source, code_open, output, shape_slider, speed, paused, finished, selected_drawing, drawings) =>
  new Model(source,
  code_open,
  output,
  shape_slider,
  speed,
  paused,
  finished,
  selected_drawing,
  drawings);
export const Model$isModel = (value) => value instanceof Model;
export const Model$Model$source = (value) => value.source;
export const Model$Model$0 = (value) => value.source;
export const Model$Model$code_open = (value) => value.code_open;
export const Model$Model$1 = (value) => value.code_open;
export const Model$Model$output = (value) => value.output;
export const Model$Model$2 = (value) => value.output;
export const Model$Model$shape_slider = (value) => value.shape_slider;
export const Model$Model$3 = (value) => value.shape_slider;
export const Model$Model$speed = (value) => value.speed;
export const Model$Model$4 = (value) => value.speed;
export const Model$Model$paused = (value) => value.paused;
export const Model$Model$5 = (value) => value.paused;
export const Model$Model$finished = (value) => value.finished;
export const Model$Model$6 = (value) => value.finished;
export const Model$Model$selected_drawing = (value) => value.selected_drawing;
export const Model$Model$7 = (value) => value.selected_drawing;
export const Model$Model$drawings = (value) => value.drawings;
export const Model$Model$8 = (value) => value.drawings;

export class SetCode extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetCode = ($0) => new SetCode($0);
export const Msg$isSetCode = (value) => value instanceof SetCode;
export const Msg$SetCode$0 = (value) => value[0];

export class SetShapeSlider extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetShapeSlider = ($0) => new SetShapeSlider($0);
export const Msg$isSetShapeSlider = (value) => value instanceof SetShapeSlider;
export const Msg$SetShapeSlider$0 = (value) => value[0];

export class SetSpeed extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetSpeed = ($0) => new SetSpeed($0);
export const Msg$isSetSpeed = (value) => value instanceof SetSpeed;
export const Msg$SetSpeed$0 = (value) => value[0];

export class TogglePause extends $CustomType {}
export const Msg$TogglePause$const = new TogglePause();
export const Msg$TogglePause = () => Msg$TogglePause$const;
export const Msg$isTogglePause = (value) => value instanceof TogglePause;

export class SetFinished extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SetFinished = ($0) => new SetFinished($0);
export const Msg$isSetFinished = (value) => value instanceof SetFinished;
export const Msg$SetFinished$0 = (value) => value[0];

export class Replay extends $CustomType {}
export const Msg$Replay$const = new Replay();
export const Msg$Replay = () => Msg$Replay$const;
export const Msg$isReplay = (value) => value instanceof Replay;

export class SelectDrawing extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const Msg$SelectDrawing = ($0) => new SelectDrawing($0);
export const Msg$isSelectDrawing = (value) => value instanceof SelectDrawing;
export const Msg$SelectDrawing$0 = (value) => value[0];

export class ToggleCode extends $CustomType {}
export const Msg$ToggleCode$const = new ToggleCode();
export const Msg$ToggleCode = () => Msg$ToggleCode$const;
export const Msg$isToggleCode = (value) => value instanceof ToggleCode;

const default_code = "fn draw(shape_slider: Int) -> List(Path) {\n  [\n    Path(Line(Point(0, 0), Point(100, 100)), 0, 10, 2),    \n]\n}\n";

const default_drawing = "Default";

const library_key = "animator-drawings";

const selected_key = "animator-selected";

const default_speed = 1.0;

const default_shape_slider = 10;

/**
 * Your app's public address, once you've deployed it in Problem 13, such as
 * "https://your-username.github.io/animator/".
 */
export const public_url = "";

/**
 * Set to True if you would like your app's URL included in the course gallery.
 */
export const include_app_in_gallery = false;

/**
 * A link to your video from Problem 14, which anyone with the link can watch.
 */
export const video_url = "";

/**
 * Set to True if you would like your video included in the course gallery.
 */
export const include_video_in_gallery = false;

function default_library() {
  return listPrepend([default_drawing, default_code], $examples.all);
}

function encode_library(drawings) {
  let _pipe = $json.array(
    drawings,
    (entry) => {
      let name = entry[0];
      let source = entry[1];
      return $json.preprocessed_array(
        listPrepend(
          $json.string(name),
          listPrepend($json.string(source), $List$Empty$const),
        ),
      );
    },
  );
  return $json.to_string(_pipe);
}

function decode_library(raw) {
  let decoder = $decode.then$(
    $decode.list($decode.list($decode.string)),
    (pairs) => {
      return $decode.success(
        $list.filter_map(
          pairs,
          (pair) => {
            if (pair instanceof $Empty) {
              return new Error(undefined);
            } else {
              let $ = pair.tail;
              if ($ instanceof $Empty) {
                return new Error(undefined);
              } else if ($.tail instanceof $Empty) {
                let name = pair.head;
                let source = $.head;
                return new Ok([name, source]);
              } else {
                return new Error(undefined);
              }
            }
          },
        ),
      );
    },
  );
  let $ = $json.parse(raw, decoder);
  if ($ instanceof Ok) {
    if ($[0] instanceof $Empty) {
      return new Error(undefined);
    } else {
      return $;
    }
  } else {
    return new Error(undefined);
  }
}

function save_library(drawings) {
  return $data.storage_set(library_key, encode_library(drawings));
}

function save_selected(name) {
  return $data.storage_set(selected_key, name);
}

function load_library() {
  let $ = $data.storage_get(library_key);
  if ($ instanceof Ok) {
    let raw = $[0];
    let $1 = decode_library(raw);
    if ($1 instanceof Ok) {
      let drawings = $1[0];
      return drawings;
    } else {
      let drawings = default_library();
      save_library(drawings);
      return drawings;
    }
  } else {
    let drawings = default_library();
    save_library(drawings);
    return drawings;
  }
}

function source_for_drawing(drawings, name) {
  return $list.find_map(
    drawings,
    (entry) => {
      let n = entry[0];
      let source = entry[1];
      let $ = n === name;
      if ($) {
        return new Ok(source);
      } else {
        return new Error(undefined);
      }
    },
  );
}

function load_selected(drawings) {
  let _block;
  if (drawings instanceof $Empty) {
    _block = default_drawing;
  } else {
    let name = drawings.head[0];
    _block = name;
  }
  let fallback = _block;
  let $ = $data.storage_get(selected_key);
  if ($ instanceof Ok) {
    let name = $[0];
    let $1 = source_for_drawing(drawings, name);
    if ($1 instanceof Ok) {
      return name;
    } else {
      return fallback;
    }
  } else {
    return fallback;
  }
}

function update_drawing_source(drawings, name, source) {
  let $ = $list.any(drawings, (entry) => { return entry[0] === name; });
  if ($) {
    return $list.map(
      drawings,
      (entry) => {
        let n = entry[0];
        let $1 = n === name;
        if ($1) {
          return [n, source];
        } else {
          return entry;
        }
      },
    );
  } else {
    return $list.append(
      drawings,
      listPrepend([name, source], $List$Empty$const),
    );
  }
}

export function init(_) {
  let drawings = load_library();
  let selected = load_selected(drawings);
  let _block;
  let $ = source_for_drawing(drawings, selected);
  if ($ instanceof Ok) {
    let s = $[0];
    _block = s;
  } else {
    _block = default_code;
  }
  let source = _block;
  return [
    new Model(
      source,
      true,
      "",
      default_shape_slider,
      default_speed,
      false,
      false,
      selected,
      drawings,
    ),
    $effect.batch(
      listPrepend(
        $effect.from(
          (dispatch) => {
            return $render.on_finished_change(
              (finished) => { return dispatch(new SetFinished(finished)); },
            );
          },
        ),
        listPrepend(
          $editor.mount(source, (var0) => { return new SetCode(var0); }),
          listPrepend(
            $effect.from(
              (dispatch) => { return dispatch(new SetCode(source)); },
            ),
            $List$Empty$const,
          ),
        ),
      ),
    ),
  ];
}

function run_source(shape_slider, source) {
  let $ = $parser.parse_program(source, $builtins.global_frame());
  if ($ instanceof Ok) {
    let program = $[0];
    let _pipe = $drawing.try_draw(shape_slider, program);
    return $result.map_error(_pipe, $errors.error_message);
  } else {
    return $;
  }
}

/**
 * Convert Paths to RenderPaths and push them to the page canvas.
 * When reset is True, the reveal restarts from time 0 (used on code edits).
 * When False, the clock is kept so a finished drawing stays complete while
 * the shape slider morphs the geometry.
 * 
 * @ignore
 */
function push_drawing(paths, speed, reset) {
  return $effect.from(
    (_) => {
      let strokes = $list.map(paths, $render.render_path);
      $render.set_speed(speed);
      $render.set_drawing(strokes);
      if (reset) {
        return $render.reset_clock();
      } else {
        return undefined;
      }
    },
  );
}

/**
 * The rate the canvas should actually run at: 0.0 while paused, otherwise the
 * speed slider's value.
 * 
 * @ignore
 */
function effective_rate(model) {
  let $ = model.paused;
  if ($) {
    return 0.0;
  } else {
    return model.speed;
  }
}

function apply_drawing(model, source, shape_slider, reset) {
  let $ = run_source(shape_slider, source);
  if ($ instanceof Ok) {
    let paths = $[0];
    return [
      new Model(
        source,
        model.code_open,
        "",
        shape_slider,
        model.speed,
        model.paused,
        model.finished,
        model.selected_drawing,
        model.drawings,
      ),
      push_drawing(paths, effective_rate(model), reset),
    ];
  } else {
    let msg = $[0];
    return [
      new Model(
        source,
        model.code_open,
        msg,
        shape_slider,
        model.speed,
        model.paused,
        model.finished,
        model.selected_drawing,
        model.drawings,
      ),
      $effect.none(),
    ];
  }
}

function set_canvas_speed(rate) {
  return $effect.from((_) => { return $render.set_speed(rate); });
}

function apply_speed(model, speed) {
  let model$1 = new Model(
    model.source,
    model.code_open,
    model.output,
    model.shape_slider,
    speed,
    model.paused,
    model.finished,
    model.selected_drawing,
    model.drawings,
  );
  return [model$1, set_canvas_speed(effective_rate(model$1))];
}

function apply_pause(model) {
  let model$1 = new Model(
    model.source,
    model.code_open,
    model.output,
    model.shape_slider,
    model.speed,
    !model.paused,
    model.finished,
    model.selected_drawing,
    model.drawings,
  );
  return [model$1, set_canvas_speed(effective_rate(model$1))];
}

function apply_replay(model) {
  let _block;
  let $ = model.speed === 0.0;
  if ($) {
    _block = default_speed;
  } else {
    _block = model.speed;
  }
  let speed = _block;
  let model$1 = new Model(
    model.source,
    model.code_open,
    model.output,
    model.shape_slider,
    speed,
    false,
    model.finished,
    model.selected_drawing,
    model.drawings,
  );
  return [
    model$1,
    $effect.from(
      (_) => {
        $render.set_speed(effective_rate(model$1));
        return $render.reset_clock();
      },
    ),
  ];
}

function apply_select_drawing(model, name) {
  let $ = source_for_drawing(model.drawings, name);
  if ($ instanceof Ok) {
    let source = $[0];
    save_selected(name);
    let model$1 = new Model(
      model.source,
      model.code_open,
      model.output,
      model.shape_slider,
      model.speed,
      model.paused,
      model.finished,
      name,
      model.drawings,
    );
    let $1 = apply_drawing(model$1, source, model$1.shape_slider, true);
    let model$2 = $1[0];
    let draw_effect = $1[1];
    return [
      model$2,
      $effect.batch(
        listPrepend(
          $editor.mount(source, (var0) => { return new SetCode(var0); }),
          listPrepend(draw_effect, $List$Empty$const),
        ),
      ),
    ];
  } else {
    return [model, $effect.none()];
  }
}

function apply_set_code(model, text) {
  let drawings = update_drawing_source(
    model.drawings,
    model.selected_drawing,
    text,
  );
  save_library(drawings);
  return apply_drawing(
    new Model(
      model.source,
      model.code_open,
      model.output,
      model.shape_slider,
      model.speed,
      model.paused,
      model.finished,
      model.selected_drawing,
      drawings,
    ),
    text,
    model.shape_slider,
    !model.paused,
  );
}

export function update(model, msg) {
  if (msg instanceof SetCode) {
    let text = msg[0];
    return apply_set_code(model, text);
  } else if (msg instanceof SetShapeSlider) {
    let value = msg[0];
    return apply_drawing(model, model.source, value, false);
  } else if (msg instanceof SetSpeed) {
    let speed = msg[0];
    return apply_speed(model, speed);
  } else if (msg instanceof TogglePause) {
    return apply_pause(model);
  } else if (msg instanceof SetFinished) {
    let finished = msg[0];
    return [
      new Model(
        model.source,
        model.code_open,
        model.output,
        model.shape_slider,
        model.speed,
        model.paused,
        finished,
        model.selected_drawing,
        model.drawings,
      ),
      $effect.none(),
    ];
  } else if (msg instanceof Replay) {
    return apply_replay(model);
  } else if (msg instanceof SelectDrawing) {
    let name = msg[0];
    return apply_select_drawing(model, name);
  } else {
    return [
      new Model(
        model.source,
        !model.code_open,
        model.output,
        model.shape_slider,
        model.speed,
        model.paused,
        model.finished,
        model.selected_drawing,
        model.drawings,
      ),
      $effect.none(),
    ];
  }
}

/**
 * Speed UI is 0..300 in steps of 100 → whole rates -1, 0, 1, 2.
 * Slider 0 is reverse (-1); 200 is normal (1); 300 is 2×.
 * 
 * @ignore
 */
function view_speed_slider(model) {
  let rate = $float.round(model.speed);
  let position = (rate + 1) * 100;
  return $html.label(
    listPrepend($attr.class$("control"), $List$Empty$const),
    listPrepend(
      $html.span(
        listPrepend($attr.class$("control-label"), $List$Empty$const),
        listPrepend($html.text("speed"), $List$Empty$const),
      ),
      listPrepend(
        $html.input(
          listPrepend(
            $attr.type_("range"),
            listPrepend(
              $attr.min("0"),
              listPrepend(
                $attr.max("300"),
                listPrepend(
                  $attr.step("100"),
                  listPrepend(
                    $attr.value($int.to_string(position)),
                    listPrepend(
                      $attr.attribute("data-test-id", "speed-slider"),
                      listPrepend(
                        $event.on_input(
                          (v) => {
                            return new SetSpeed(
                              (() => {
                                let $ = $int.parse(v);
                                if ($ instanceof Ok) {
                                  let n = $[0];
                                  return $int.to_float(
                                    (globalThis.Math.trunc(n / 100)) - 1,
                                  );
                                } else {
                                  return model.speed;
                                }
                              })(),
                            );
                          },
                        ),
                        $List$Empty$const,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        listPrepend(
          $html.span(
            listPrepend($attr.class$("control-value"), $List$Empty$const),
            listPrepend($html.text($int.to_string(rate)), $List$Empty$const),
          ),
          $List$Empty$const,
        ),
      ),
    ),
  );
}

function view_shape_slider(model) {
  return $html.label(
    listPrepend($attr.class$("control"), $List$Empty$const),
    listPrepend(
      $html.span(
        listPrepend($attr.class$("control-label"), $List$Empty$const),
        listPrepend($html.text("shape"), $List$Empty$const),
      ),
      listPrepend(
        $html.input(
          listPrepend(
            $attr.type_("range"),
            listPrepend(
              $attr.min("0"),
              listPrepend(
                $attr.max("100"),
                listPrepend(
                  $attr.value($int.to_string(model.shape_slider)),
                  listPrepend(
                    $attr.attribute("data-test-id", "shape-slider"),
                    listPrepend(
                      $event.on_input(
                        (v) => {
                          return new SetShapeSlider(
                            $result.unwrap($int.parse(v), model.shape_slider),
                          );
                        },
                      ),
                      $List$Empty$const,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        listPrepend(
          $html.span(
            listPrepend($attr.class$("control-value"), $List$Empty$const),
            listPrepend(
              $html.text($int.to_string(model.shape_slider)),
              $List$Empty$const,
            ),
          ),
          $List$Empty$const,
        ),
      ),
    ),
  );
}

function view_pause_button(model) {
  let _block;
  let $1 = model.finished;
  let $2 = model.paused;
  if ($1) {
    _block = ["↻", "Replay", Msg$Replay$const];
  } else if ($2) {
    _block = ["▶", "Play", Msg$TogglePause$const];
  } else {
    _block = ["⏸", "Pause", Msg$TogglePause$const];
  }
  let $ = _block;
  let icon = $[0];
  let label = $[1];
  let msg = $[2];
  return $html.button(
    listPrepend(
      $attr.class$("icon-btn pause-button"),
      listPrepend(
        $attr.attribute("title", label),
        listPrepend(
          $attr.attribute("aria-label", label),
          listPrepend(
            $attr.attribute("data-test-id", "pause-button"),
            listPrepend($event.on_click(msg), $List$Empty$const),
          ),
        ),
      ),
    ),
    listPrepend($html.text(icon), $List$Empty$const),
  );
}

function view_controls(model) {
  return $html.div(
    listPrepend($attr.class$("canvas-controls"), $List$Empty$const),
    listPrepend(
      view_pause_button(model),
      listPrepend(
        view_shape_slider(model),
        listPrepend(view_speed_slider(model), $List$Empty$const),
      ),
    ),
  );
}

function view_reveal_code(model) {
  let $ = model.code_open;
  if ($) {
    return $element.none();
  } else {
    return $html.button(
      listPrepend(
        $attr.class$("icon-btn reveal-code"),
        listPrepend(
          $attr.attribute("title", "Show code"),
          listPrepend($event.on_click(Msg$ToggleCode$const), $List$Empty$const),
        ),
      ),
      listPrepend($html.text("⟩"), $List$Empty$const),
    );
  }
}

function view_anim(model) {
  return $html.div(
    listPrepend($attr.class$("canvas-area"), $List$Empty$const),
    listPrepend(
      view_reveal_code(model),
      listPrepend(
        $html.canvas(
          listPrepend(
            $attr.id("animation-canvas"),
            listPrepend($attr.class$("canvas"), $List$Empty$const),
          ),
        ),
        listPrepend(
          view_controls(model),
          listPrepend(
            (() => {
              let $ = model.output;
              if ($ === "") {
                return $element.none();
              } else {
                let msg = $;
                return $html.pre(
                  listPrepend($attr.class$("output"), $List$Empty$const),
                  listPrepend($html.text(msg), $List$Empty$const),
                );
              }
            })(),
            $List$Empty$const,
          ),
        ),
      ),
    ),
  );
}

function view_drawing_select(model) {
  return $html.select(
    listPrepend(
      $attr.class$("drawing-select"),
      listPrepend(
        $attr.attribute("data-test-id", "drawing-select"),
        listPrepend(
          $event.on_input((var0) => { return new SelectDrawing(var0); }),
          $List$Empty$const,
        ),
      ),
    ),
    $list.map(
      model.drawings,
      (entry) => {
        let name = entry[0];
        return $html.option(
          listPrepend(
            $attr.value(name),
            listPrepend(
              $attr.selected(name === model.selected_drawing),
              $List$Empty$const,
            ),
          ),
          name,
        );
      },
    ),
  );
}

export function view(model) {
  let _block;
  let $ = model.code_open;
  if ($) {
    _block = "app";
  } else {
    _block = "app code-hidden";
  }
  let app_class = _block;
  return $html.div(
    listPrepend($attr.class$(app_class), $List$Empty$const),
    listPrepend(
      $html.div(
        listPrepend($attr.class$("code-col"), $List$Empty$const),
        listPrepend(
          $editor.view_panel(Msg$ToggleCode$const, view_drawing_select(model)),
          $List$Empty$const,
        ),
      ),
      listPrepend(view_anim(model), $List$Empty$const),
    ),
  );
}

export function main() {
  let app = $lustre.application(init, update, view);
  let $ = $lustre.start(app, "#app", undefined);
  if (!($ instanceof Ok)) {
    throw makeError(
      "let_assert",
      FILEPATH,
      "app",
      527,
      "main",
      "Pattern match failed, no pattern matched the value.",
      {
        value: $,
        start: 16370,
        end: 16419,
        pattern_start: 16381,
        pattern_end: 16386
      }
    )
  }
  return undefined;
}
