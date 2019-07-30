import * as m from "mithril";
import { nonNull } from "./utils";
import { App, getSize } from "./index";
import { redraw } from "./canvas";

export function renderPage(app: App) {
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

  return m(
    "div",
    m(
      ".tm-options-container",
      makeOption(
        "size",
        "Token size:",
        m(
          "select",
          {
            onchange: function() {
              const select = <HTMLSelectElement>this;
              if (select.value === "custom") {
                app.update({ ...app.state(), size: { kind: "custom" } });
              } else {
                const size =
                  select.value === "extra_small"
                    ? 64
                    : select.value === "small"
                    ? 128
                    : select.value === "medium"
                    ? 256
                    : select.value === "print"
                    ? 300
                    : select.value === "huge"
                    ? 384
                    : null;
                if (size == null) {
                  throw "Did not recognize size " + select.value;
                }
                app.update({
                  ...app.state(),
                  size: {
                    kind: "builtin",
                    value: { width: size, height: size }
                  }
                });
              }
            }
          },
          m("option", { value: "custom" }, "Custom size"),
          m("option", { value: "extra_small" }, "Extra small (64x64)"),
          m("option", { value: "small" }, "Small (128x128)"),
          m(
            "option",
            { value: "medium", selected: "selected" },
            "Medium (256x256)"
          ),
          m("option", { value: "print" }, "Print (300x300)"),
          m("option", { value: "huge" }, "Large (384x384)")
        )
      ),
      ...(app.state().size.kind === "custom"
        ? [
            m(
              ".tm-flexrow",
              m(
                ".tm-flexgrow",
                makeOption(
                  "size-width",
                  "Width:",
                  m("input", {
                    class: "tm-small-input",
                    type: "number",
                    min: 1,
                    max: 384,
                    value: app.state().customSize.width,
                    oninput: function() {
                      const input = <HTMLInputElement>this;
                      const value = Math.min(input.valueAsNumber, 384);
                      app.update({
                        ...app.state(),
                        customSize: {
                          ...app.state().customSize,
                          width: value
                        }
                      });
                    }
                  })
                )
              ),
              m(
                ".tm-flexgrow",
                makeOption(
                  "size-height",
                  "Height:",
                  m("input", {
                    class: "tm-small-input",
                    type: "number",
                    min: 1,
                    max: 384,
                    value: app.state().customSize.height,
                    oninput: function() {
                      const input = <HTMLInputElement>this;
                      const value = Math.min(input.valueAsNumber, 384);
                      app.update({
                        ...app.state(),
                        customSize: {
                          ...app.state().customSize,
                          height: value
                        }
                      });
                    }
                  })
                )
              )
            )
          ]
        : []),
      makeOption(
        "bg-color",
        "Background color:",
        m(
          "select",
          {
            onchange: function() {
              const select = <HTMLSelectElement>this;
              const backgroundColor =
                select.value == "custom"
                  ? <{ kind: "custom" }>{ kind: "custom" }
                  : select.value == "image"
                  ? <{ kind: "image" }>{ kind: "image" }
                  : <{ kind: "builtin"; value: string }>{
                      kind: "builtin",
                      value: select.value
                    };
              app.update({ ...app.state(), backgroundColor });
            }
          },
          m("option", { value: "image" }, "Upload image"),
          m("option", { value: "custom" }, "Custom color"),
          m(
            "optgroup",
            { label: "Built-in colors" },
            m("option", { value: "white", selected: "selected" }, "White"),
            m("option", { value: "red" }, "Red"),
            m("option", { value: "green" }, "Green"),
            m("option", { value: "blue" }, "Blue")
          )
        )
      ),
      ...(app.state().backgroundColor.kind === "custom"
        ? [
            makeOption(
              "custom-color",
              "Custom color:",
              m("input", {
                type: "text",
                value: app.state().customColor,
                oninput: function() {
                  const input = <HTMLInputElement>this;
                  app.update({ ...app.state(), customColor: input.value });
                }
              })
            ),
            m(
              ".hint",
              "All HTML color names, hex codes (#XXXXXX), rgb(XXX, XXX, XXX), and rgba(XXX, XXX, XXX, XXX) are supported."
            )
          ]
        : []),
      m(
        "div",
        {
          key: "background-image",
          style:
            app.state().backgroundColor.kind === "image"
              ? "display:block;"
              : "display:none;"
        },
        makeOption(
          "background-image",
          "Background image:",
          m(
            "div",
            m("input", {
              type: "file",
              accept: "image/*",
              oninput: function() {
                const files = (<HTMLInputElement>this).files;
                if (files != null && files.length > 0) {
                  const img = new Image();
                  img.onload = function() {
                    window.URL.revokeObjectURL(img.src);
                    app.update({ ...app.state(), backgroundImage: img });
                  };
                  img.src = window.URL.createObjectURL(files[0]);
                }
              }
            })
          )
        )
      ),
      makeOption(
        "text-color",
        "Text color:",
        m(
          "select",
          {
            onchange: function() {
              const select = <HTMLSelectElement>this;
              app.update({ ...app.state(), textColor: select.value });
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
          value: app.state().text,
          oninput: function() {
            const input = <HTMLTextAreaElement>this;
            app.update({ ...app.state(), text: input.value });
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
          ...(app.state().stroke ? { checked: "checked" } : {}),
          oninput: function() {
            const input = <HTMLInputElement>this;
            app.update({ ...app.state(), stroke: input.checked });
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
              app.update({ ...app.state(), shape });
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
              app.update({ ...app.state(), borderColor });
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
        width: getSize(app.state()).width,
        height: getSize(app.state()).height,
        onupdate: _vnode => redraw(app),
        style: "border:1px solid black"
      })
    )
  );
}

export function getCanvas(): HTMLCanvasElement {
  return <HTMLCanvasElement>nonNull(document.getElementById("token_canvas"));
}
