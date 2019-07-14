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

class App {
  view() {
    return m("div", "Hi!");
  }
}

m.mount(nonNull(document.getElementById("app")), new App());
