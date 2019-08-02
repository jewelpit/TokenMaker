import { mount } from "mithril";
import { nonNull } from "./utils";
import { renderPage } from "./page";
import { redraw } from "./canvas";

interface Size {
  width: number;
  height: number;
}

interface State {
  size:
    | {
        kind: "custom";
      }
    | { kind: "builtin"; value: Size };
  backgroundColor:
    | { kind: "image" }
    | { kind: "custom" }
    | { kind: "builtin"; value: string };

  // We store these as separate fields instead of using a variant type because
  // we want to preserve their values even when the user goes back to a built-in
  // one.
  customSize: Size;
  customColor: string;
  backgroundImage: null | HTMLImageElement;
  stretchStyle: "fill" | "fit";

  textColor: string;
  text: string;
  stroke: boolean;
  shape: "circle" | "square";
  borderColor: null | string;
}

export function getSize(state: State): Size {
  return state.size.kind == "builtin" ? state.size.value : state.customSize;
}

export class App {
  private _state: State;

  constructor() {
    this._state = {
      size: {
        kind: "builtin",
        value: {
          width: 256,
          height: 256
        }
      },
      backgroundColor: { kind: "builtin", value: "white" },
      customSize: { width: 256, height: 128 },
      customColor: "rgb(24, 45, 79)",
      backgroundImage: null,
      stretchStyle: "fill",
      textColor: "black",
      text: "",
      stroke: false,
      shape: "circle",
      borderColor: null
    };
  }

  view() {
    return renderPage(this);
  }

  state(): State {
    return this._state;
  }

  update(newState: State) {
    this._state = newState;
    console.log("Set state to:");
    console.log(this._state);
    redraw(this);
  }
}

mount(nonNull(document.getElementById("app")), new App());
