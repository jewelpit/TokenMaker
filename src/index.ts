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
  color: string;
  text: string;
  shape: "circle" | "square";
}

class App {
  private _state: State;

  constructor() {
    this._state = { color: "white", text: "", shape: "circle" };
  }

  view() {
    function makeOption(id: string, text: string, inner: m.Vnode): m.Vnode {
      return m(
        ".tm-option",
        m("label", { for: id, class: ".tm-option-label" }, text),
        m(".tm-option-input", inner)
      );
    }

    const app = this;
    return m(
      "div",
      m("h1", "Token Maker"),
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
                app._update({ ...app._state, color: select.value });
              }
            },
            m("option", { value: "white" }, "White"),
            m("option", { value: "red" }, "Red"),
            m("option", { value: "green" }, "Green"),
            m("option", { value: "blue" }, "Blue")
          )
        ),
        makeOption(
          "text",
          "Text:",
          m("input", {
            type: "text",
            oninput: function() {
              const input = <HTMLInputElement>this;
              app._update({ ...app._state, text: input.value });
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
    ctx.fillStyle = this._state.color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (this._state.shape) {
      case "square":
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        break;
      default:
        throw "Did not understand shape key '" + this._state.shape + "'";
    }

    const baseFontSize = 30;
    const fontName = "Arial";
    ctx.font = baseFontSize + "px " + fontName;
    const textSize = ctx.measureText(this._state.text);
    const multiplier = Math.min(
      canvas.width / textSize.width,
      canvas.height / (baseFontSize * 1.5)
    );
    ctx.font = Math.floor(baseFontSize * multiplier) + "px " + fontName;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this._state.text, canvas.width / 2, canvas.height / 2);
  }

  private _update(newState: State) {
    this._state = newState;
    console.log("Set state to:");
    console.log(this._state);
    this._redraw();
  }
}

m.mount(nonNull(document.getElementById("app")), new App());
