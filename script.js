/** @typedef {Map<number, {cp1x: number, cp1y: number, cp2x: number, cp2y: number}>} ControlPointsMap */

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

resizeCanvas();

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("click", drawPoint);
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    drawPoints();
    drawSpline();
  }
});

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}


/** @type {Array<{x: number, y: number}>} */
const points = []

function drawPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  points.push({ x, y });

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpline() {
  if (points.length < 2) return;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  /** @type {ControlPointsMap} controlPointsMap */
  const controlPointsMap = getControlPointsMap(points);

  for (let i = 0; i < points.length - 1; i++) {
    const { cp1x, cp2x, cp1y, cp2y } = controlPointsMap.get(i);
    const nextPoint = points[i + 1];

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextPoint.x, nextPoint.y);
  }

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}


/** @returns {ControlPointsMap} */
function getControlPointsMap(points) {
  const map = new Map();
  const t = 1;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) * t / 6;
    const cp1y = p1.y + (p2.y - p0.y) * t / 6;
    const cp2x = p2.x - (p3.x - p1.x) * t / 6;
    const cp2y = p2.y - (p3.y - p1.y) * t / 6;

    map.set(i, { cp1x, cp1y, cp2x, cp2y });
  }

  return map;
}
function getControlPoints(points, i) {
  const p0 = points[i - 1] || points[i];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[i + 2] || p2;

  const t = 0.5;

  const cp1x = p1.x + (p2.x - p0.x) / 6 * t;
  const cp1y = p1.y + (p2.y - p0.y) / 6 * t;

  const cp2x = p2.x - (p3.x - p1.x) / 6 * t;
  const cp2y = p2.y - (p3.y - p1.y) / 6 * t;

  return { cp1x, cp1y, cp2x, cp2y };
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
