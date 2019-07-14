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
}

class App {
  private _state: State;

  constructor() {
    this._state = { color: "white", text: "" };
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
        )
      ),
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
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
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
