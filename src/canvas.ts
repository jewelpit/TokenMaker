import { App, getSize } from "./index";
import { getCanvas } from "./page";
import { nonNull } from "./utils";

export function redraw(app: App) {
  const state = app.state();
  const canvas = getCanvas();
  const size = getSize(state);
  canvas.width = size.width;
  canvas.height = size.height;

  const { imageWidth, imageHeight } = (function() {
    if (
      state.backgroundColor.kind == "image" &&
      state.backgroundImage != null
    ) {
      const image = nonNull(state.backgroundImage);
      return { imageWidth: image.width, imageHeight: image.height };
    } else {
      return { imageWidth: size.width, imageHeight: size.height };
    }
  })();
  const imageScale = Math.min(
    canvas.width / imageWidth,
    canvas.height / imageHeight
  );
  const startX = canvas.width / 2 - (imageScale * imageWidth) / 2;
  const startY = canvas.height / 2 - (imageScale * imageHeight) / 2;
  const scaledWidth = imageWidth * imageScale;
  const scaledHeight = imageHeight * imageScale;

  const ctx = nonNull(canvas.getContext("2d"));

  ctx.fillStyle =
    state.backgroundColor.kind === "builtin"
      ? state.backgroundColor.value
      : state.backgroundColor.kind === "custom"
      ? state.customColor
      : "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (state.shape) {
    case "square":
      ctx.fillRect(startX, startY, scaledWidth, scaledHeight);
      break;
    case "circle":
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        scaledWidth / 2,
        scaledHeight / 2,
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
    ctx.drawImage(
      state.backgroundImage,
      startX,
      startY,
      scaledWidth,
      scaledHeight
    );
    ctx.globalCompositeOperation = composite;
  }

  if (state.borderColor !== null) {
    const borderWidth = (canvas.width + canvas.height) / 40;
    ctx.lineWidth = borderWidth;
    switch (state.shape) {
      case "square":
        ctx.strokeStyle = state.borderColor;
        ctx.strokeRect(
          startX + borderWidth / 2,
          startY + borderWidth / 2,
          scaledWidth - borderWidth,
          scaledHeight - borderWidth
        );
        break;
      case "circle":
        ctx.strokeStyle = state.borderColor;
        ctx.beginPath();
        ctx.ellipse(
          canvas.width / 2,
          canvas.height / 2,
          scaledWidth / 2 - borderWidth / 2,
          scaledHeight / 2 - borderWidth / 2,
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
    ...lines.map(line => scaledWidth / ctx.measureText(line).width),
    scaledHeight / (lines.length * baseFontSize * 1.5)
  );
  const fontSize = Math.floor(baseFontSize * multiplier);
  ctx.font = fontSize + "px " + fontName;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const stepSize = scaledHeight / (lines.length + 1);
  for (var i = 0; i < lines.length; i++) {
    const line = lines[i];
    const x = canvas.width / 2;
    const y = (i + 1) * stepSize + startY;
    ctx.fillStyle = state.textColor;
    ctx.fillText(line, x, y);
    if (state.stroke) {
      ctx.strokeStyle = state.textColor == "black" ? "white" : "black";
      ctx.lineWidth = 1;
      ctx.strokeText(line, x, y);
    }
  }
}
