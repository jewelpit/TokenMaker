import { App } from "./index";
import { getCanvas } from "./page";
import { nonNull } from "./utils";

export function redraw(app: App) {
  const state = app.state();
  const canvas = getCanvas();
  canvas.width = state.size.width;
  canvas.height = state.size.height;

  if (state.backgroundColor.kind == "image" && state.backgroundImage != null) {
    const image = nonNull(state.backgroundImage);
    const imageScale = canvas.width / image.width;
    canvas.height = image.height * imageScale;
  }

  const ctx = nonNull(canvas.getContext("2d"));

  ctx.fillStyle =
    state.backgroundColor.kind === "builtin"
      ? state.backgroundColor.value
      : state.customColor;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (state.shape) {
    case "square":
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    case "circle":
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        canvas.height / 2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      break;
    default:
      throw "Did not understand shape key '" + state.shape + "'";
  }

  if (state.backgroundColor.kind == "image" && state.backgroundImage != null) {
    const composite = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(state.backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = composite;
  }

  if (state.borderColor !== null) {
    const borderWidth = canvas.width / 20;
    ctx.lineWidth = borderWidth;
    switch (state.shape) {
      case "square":
        ctx.strokeStyle = state.borderColor;
        ctx.strokeRect(
          borderWidth / 2,
          borderWidth / 2,
          canvas.width - borderWidth,
          canvas.height - borderWidth
        );
        break;
      case "circle":
        ctx.strokeStyle = state.borderColor;
        ctx.beginPath();
        ctx.ellipse(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2 - borderWidth / 2,
          canvas.height / 2 - borderWidth / 2,
          0,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;
      default:
        throw "Did not understand shape key '" + state.shape + "'";
    }
  }

  const baseFontSize = 30;
  const fontName = "Arial";
  ctx.font = baseFontSize + "px " + fontName;
  const lines = state.text.split(/\r?\n/);
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
    ctx.fillStyle = state.textColor;
    ctx.fillText(line, canvas.width / 2, (i + 1) * stepSize);
    if (state.stroke) {
      ctx.strokeStyle = state.textColor == "black" ? "white" : "black";
      ctx.lineWidth = 1;
      ctx.strokeText(line, canvas.width / 2, (i + 1) * stepSize);
    }
  }
}
