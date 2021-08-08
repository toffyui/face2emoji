import {
  WithFaceExpressions,
  FaceDetection,
  FaceExpressions,
} from "face-api.js";

export const drawEmoji = (
  detectionsWithExpressions: WithFaceExpressions<{
    detection: FaceDetection;
    expressions: FaceExpressions;
  }>[],
  canvas: HTMLCanvasElement
) => {
  detectionsWithExpressions.forEach((detectionsWithExpression) => {
    const ctx = canvas.getContext("2d");
    const Array = Object.entries(detectionsWithExpression.expressions);
    const scoresArray = Array.map((i) => i[1]);
    const expressionsArray = Array.map((i) => i[0]);
    const max = Math.max.apply(null, scoresArray);
    const index = scoresArray.findIndex((score) => score === max);
    const expression = expressionsArray[index];
    const image = document.createElement("img");
    image.onload = () => {
      const width = detectionsWithExpression.detection.box.height * 1.3;
      const height = detectionsWithExpression.detection.box.height * 1.3;

      const x = detectionsWithExpression.detection.box.x - width * 0.15;
      const y = detectionsWithExpression.detection.box.y - height * 0.15;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, x, y, width, height);
    };
    image.src = `/emojis/${expression}.png`;
  });
};
