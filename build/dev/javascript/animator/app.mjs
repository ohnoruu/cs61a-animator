//# sourceMappingURL=app.mjs.map
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
import * as $drawing from "./drawing.mjs";
import * as $editor from "./editor.mjs";
import * as $errors from "./errors.mjs";
import {
  Ok,
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
  constructor(source, code_open, output, shape_slider, speed) {
    super();
    this.source = source;
    this.code_open = code_open;
    this.output = output;
    this.shape_slider = shape_slider;
    this.speed = speed;
  }
}
export const Model$Model = (source, code_open, output, shape_slider, speed) =>
  new Model(source, code_open, output, shape_slider, speed);
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

export class ToggleCode extends $CustomType {}
export const Msg$ToggleCode$const = new ToggleCode();
export const Msg$ToggleCode = () => Msg$ToggleCode$const;
export const Msg$isToggleCode = (value) => value instanceof ToggleCode;

const default_code = "fn draw(shape_slider: Int) -> List(Path) {\n  [\n    Path(Line(Point(0, 0), Point(100, 100)), 0, 10, 2),    \n]\n}\n";

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

export function init(_) {
  return [
    new Model("", true, "", default_shape_slider, default_speed),
    $effect.batch(
      listPrepend(
        $editor.mount(default_code, (var0) => { return new SetCode(var0); }),
        listPrepend(
          $effect.from(
            (dispatch) => { return dispatch(new SetCode(default_code)); },
          ),
          $List$Empty$const,
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

function apply_drawing(model, source, shape_slider, reset) {
  let $ = run_source(shape_slider, source);
  if ($ instanceof Ok) {
    let paths = $[0];
    return [
      new Model(source, model.code_open, "", shape_slider, model.speed),
      push_drawing(paths, model.speed, reset),
    ];
  } else {
    let msg = $[0];
    return [
      new Model(source, model.code_open, msg, shape_slider, model.speed),
      $effect.none(),
    ];
  }
}

function apply_speed(model, speed) {
  return [
    new Model(
      model.source,
      model.code_open,
      model.output,
      model.shape_slider,
      speed,
    ),
    $effect.from((_) => { return $render.set_speed(speed); }),
  ];
}

export function update(model, msg) {
  if (msg instanceof SetCode) {
    let text = msg[0];
    return apply_drawing(model, text, model.shape_slider, true);
  } else if (msg instanceof SetShapeSlider) {
    let value = msg[0];
    return apply_drawing(model, model.source, value, false);
  } else if (msg instanceof SetSpeed) {
    let speed = msg[0];
    return apply_speed(model, speed);
  } else {
    return [
      new Model(
        model.source,
        !model.code_open,
        model.output,
        model.shape_slider,
        model.speed,
      ),
      $effect.none(),
    ];
  }
}

/**
 * Speed UI is 0..300 hundredths of normal rate → 0.0 (pause) .. 3.0.
 * 
 * @ignore
 */
function view_speed_slider(model) {
  let hundredths = $float.round(model.speed * 100.0);
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
                  $attr.value($int.to_string(hundredths)),
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
                                return $int.to_float(n) / 100.0;
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
        listPrepend(
          $html.span(
            listPrepend($attr.class$("control-value"), $List$Empty$const),
            listPrepend(
              $html.text($float.to_string(model.speed)),
              $List$Empty$const,
            ),
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

function view_controls(model) {
  return $html.div(
    listPrepend($attr.class$("canvas-controls"), $List$Empty$const),
    listPrepend(
      view_shape_slider(model),
      listPrepend(view_speed_slider(model), $List$Empty$const),
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
        listPrepend($editor.view_panel(Msg$ToggleCode$const), $List$Empty$const),
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
      261,
      "main",
      "Pattern match failed, no pattern matched the value.",
      {
        value: $,
        start: 8595,
        end: 8644,
        pattern_start: 8606,
        pattern_end: 8611
      }
    )
  }
  return undefined;
}
