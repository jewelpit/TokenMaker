import * as m from "mithril";

function assert(condition: boolean, message?: string) {
  if (condition) {
    return;
  }

  const msg = message != null ? message : "Assertion failed";
  throw new Error(msg);
}

function nonNull<T>(item: T | null | undefined) {
  if (item != null) {
    return item;
  }

  throw new Error("Item was null");
}

interface State {
  backgroundColor: null | string;

  // We store this as a separate field instead of using a variant type for
  // backgroundColor because we want to preserve its values even when the user
  // goes back to a built-in color.
  customColor: string;
  textColor: string;
  text: string;
  stroke: boolean;
  shape: "circle" | "square";
  borderColor: null | string;
}

class App {
  private _state: State;

  constructor() {
    this._state = {
      backgroundColor: "white",
      customColor: "rgb(24, 45, 79)",
      textColor: "black",
      text: "",
      stroke: false,
      shape: "circle",
      borderColor: null
    };
  }

  view() {
    function makeOption(
      id: string,
      text: string,
      inner: m.Vnode,
      lineBreak = false
    ): m.Vnode {
      return m(
        lineBreak ? ".tm-option-vert" : ".tm-option",
        m("label", { for: id, class: ".tm-option-label" }, text),
        m(".tm-option-input", inner)
      );
    }

    const app = this;
    return m(
      "div",
      m(
        ".tm-options-container",
        makeOption(
          "bg-color",
          "Background color:",
          m(
            "select",
            {
              onchange: function() {
                const select = <HTMLSelectElement>this;
                const backgroundColor =
                  select.value == "custom" ? null : select.value;
                app._update({ ...app._state, backgroundColor });
              }
            },
            m("option", { value: "custom" }, "Custom"),
            m("option", { value: "white", selected: "selected" }, "White"),
            m("option", { value: "red" }, "Red"),
            m("option", { value: "green" }, "Green"),
            m("option", { value: "blue" }, "Blue")
          )
        ),
        ...(app._state.backgroundColor == null
          ? [
              makeOption(
                "custom-color",
                "Custom color:",
                m("input", {
                  type: "text",
                  value: app._state.customColor,
                  oninput: function() {
                    const input = <HTMLInputElement>this;
                    app._update({ ...app._state, customColor: input.value });
                  }
                })
              ),
              m(
                ".hint",
                "All HTML color names, hex codes (#XXXXXX), rgb(XXX, XXX, XXX), and rgba(XXX, XXX, XXX, XXX) are supported."
              )
            ]
          : []),
        makeOption(
          "text-color",
          "Text color:",
          m(
            "select",
            {
              onchange: function() {
                const select = <HTMLSelectElement>this;
                app._update({ ...app._state, textColor: select.value });
              }
            },
            m("option", { value: "black" }, "Black"),
            m("option", { value: "white" }, "White")
          )
        ),
        makeOption(
          "text",
          "Text:",
          m("textarea", {
            value: app._state.text,
            oninput: function() {
              const input = <HTMLTextAreaElement>this;
              app._update({ ...app._state, text: input.value });
            }
          }),
          true
        ),
        makeOption(
          "stroke",
          "Stroke text:",
          m("input", {
            class: "tm-small-input",
            type: "checkbox",
            ...(app._state.stroke ? { checked: "checked" } : {}),
            oninput: function() {
              const input = <HTMLInputElement>this;
              app._update({ ...app._state, stroke: input.checked });
            }
          })
        ),
        makeOption(
          "shape",
          "Shape:",
          m(
            "select",
            {
              onchange: function() {
                const input = <HTMLInputElement>this;
                const shape = input.value;
                if (shape !== "circle" && shape !== "square") {
                  throw "Did not understand shape key '" + shape + "'";
                }
                app._update({ ...app._state, shape });
              }
            },
            m("option", { value: "circle" }, "Circle"),
            m("option", { value: "square" }, "Square")
          )
        ),
        makeOption(
          "border-color",
          "Border color:",
          m(
            "select",
            {
              onchange: function() {
                const input = <HTMLInputElement>this;
                const borderColor = input.value === "none" ? null : input.value;
                app._update({ ...app._state, borderColor });
              }
            },
            m("option", { value: "none" }, "None"),
            m("option", { value: "black" }, "Black"),
            m("option", { value: "silver" }, "Silver"),
            m("option", { value: "gold" }, "Gold")
          )
        )
      ),
      m("p", "To save: right click and select 'Save Image As...'"),
      m(
        "p",
        m("canvas", {
          id: "token_canvas",
          width: 256,
          height: 256,
          style: "border:1px solid black"
        })
      )
    );
  }

  private static getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>nonNull(document.getElementById("token_canvas"));
  }

  private _redraw() {
    const canvas = App.getCanvas();
    const ctx = nonNull(canvas.getContext("2d"));
    ctx.fillStyle = this._state.backgroundColor || this._state.customColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const borderWidth = 12;
    ctx.lineWidth = borderWidth;
    switch (this._state.shape) {
      case "square":
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (this._state.borderColor !== null) {
          ctx.strokeStyle = this._state.borderColor;
          ctx.strokeRect(
            borderWidth / 2,
            borderWidth / 2,
            canvas.width - borderWidth,
            canvas.height - borderWidth
          );
        }
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
        if (this._state.borderColor !== null) {
          ctx.strokeStyle = this._state.borderColor;
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2 - borderWidth / 2,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        }
        break;
      default:
        throw "Did not understand shape key '" + this._state.shape + "'";
    }

    const baseFontSize = 30;
    const fontName = "Arial";
    ctx.font = baseFontSize + "px " + fontName;
    const lines = this._state.text.split(/\r?\n/);
    const multiplier = Math.min(
      ...lines.map(line => canvas.width / ctx.measureText(line).width),
      canvas.height / (lines.length * baseFontSize * 1.5)
    );
    const fontSize = Math.floor(baseFontSize * multiplier);
    ctx.font = fontSize + "px " + fontName;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const stepSize = canvas.height / (lines.length + 1);
    for (var i = 0; i < lines.length; i++) {
      const line = lines[i];
      ctx.fillStyle = this._state.textColor;
      ctx.fillText(line, canvas.width / 2, (i + 1) * stepSize);
      if (this._state.stroke) {
        ctx.strokeStyle = this._state.textColor == "black" ? "white" : "black";
        ctx.lineWidth = 1;
        ctx.strokeText(line, canvas.width / 2, (i + 1) * stepSize);
      }
    }
  }

  private _update(newState: State) {
    this._state = newState;
    console.log("Set state to:");
    console.log(this._state);
    this._redraw();
  }
}

m.mount(nonNull(document.getElementById("app")), new App());
