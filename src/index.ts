import { mount } from "mithril";
import { nonNull } from "./utils";
import { renderPage } from "./page";
import { redraw } from "./canvas";

interface State {
  size: {
    width: number;
    height: number;
  };
  backgroundColor:
    | { kind: "image" }
    | { kind: "custom" }
    | { kind: "builtin"; value: string };

  // We store this as a separate field instead of using a variant type for
  // backgroundColor because we want to preserve its values even when the user
  // goes back to a built-in color.
  customColor: string;

  // Same with this.
  backgroundImage: null | HTMLImageElement;

  textColor: string;
  text: string;
  stroke: boolean;
  shape: "circle" | "square";
  borderColor: null | string;
}

export class App {
  private _state: State;

  constructor() {
    this._state = {
      size: {
        width: 256,
        height: 256
      },
      backgroundColor: { kind: "builtin", value: "white" },
      customColor: "rgb(24, 45, 79)",
      backgroundImage: null,
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
