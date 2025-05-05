/*
   https://mmrndev.medium.com/understanding-b%C3%A9zier-curves-f6eaa0fa6c7d
*/

/** @typedef {Map<number, {cp1x: number, cp1y: number, cp2x: number, cp2y: number}>} ControlPointsMap */

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")

resizeCanvas()

window.addEventListener("resize", resizeCanvas)
canvas.addEventListener("click", drawPoint)
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    drawPoints()

    const controlPointsMap = getControlPointsMap(points)
    drawSpline(controlPointsMap)
    if (points.length > 2) animate(controlPointsMap)
  }
})

/** @param {ControlPointsMap} controlPointsMap */
function animate(controlPointsMap) {
  let startTime = null
  const durationMs = 5000

  function animateStep(timestamp) {
    if (startTime === null) startTime = timestamp

    const elapsed = timestamp - startTime

    let progress = elapsed / durationMs
    if (progress > 1) progress = 1

    const position = getPosition(progress, controlPointsMap)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawPoints()
    drawSpline(controlPointsMap)

    ctx.fillStyle = "green"
    ctx.beginPath()
    ctx.arc(position.x, position.y, 5, 0, Math.PI * 2)
    ctx.fill()

    if (progress < 1) requestAnimationFrame(animateStep)
  }

  requestAnimationFrame(animateStep)
}

function drawPoints() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "red"
  points.forEach(point => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
    ctx.fill()
  })
}

/** @type {Array<{x: number, y: number}>} */
const points = []

function drawPoint(event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  points.push({ x, y })

  ctx.fillStyle = "red"
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, Math.PI * 2)
  ctx.fill()
}

/** @param {ControlPointsMap} controlPointsMap */
function drawSpline(controlPointsMap) {
  if (points.length < 2) return

  ctx.save()

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 0; i < points.length - 1; i++) {
    const { cp1x, cp1y, cp2x, cp2y } = controlPointsMap.get(i)
    const nextPoint = points[i + 1]

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextPoint.x, nextPoint.y)
  }

  ctx.strokeStyle = "blue"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.restore()
}

/** @returns {ControlPointsMap} */
function getControlPointsMap(points) {
  const map = new Map()
  const t = 1

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2

    const cp1x = p1.x + (p2.x - p0.x) * t / 6
    const cp1y = p1.y + (p2.y - p0.y) * t / 6
    const cp2x = p2.x - (p3.x - p1.x) * t / 6
    const cp2y = p2.y - (p3.y - p1.y) * t / 6

    map.set(i, { cp1x, cp1y, cp2x, cp2y })
  }

  return map
}

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

/**
* @param {number} progress
* @param {ControlPointsMap} controlPointsMap
* @returns {{ x: number, y: number }} - ponto atual na curva bezier
*/
function getPosition(progress, controlPointsMap) {
  const segments = points.length - 1 // numero de segmentos

  const currentSegment = Math.min(Math.floor(progress * segments), segments - 1) // pra não pegar no caso de estar no ultimo ponto

  // currentSegment / segments = starting point do segmento atuyal
  // progress - ( currentSegment / segments ) = quanto avançamos desde o incio
  const t = (progress - (currentSegment / segments)) * segments // t => progresso no segmento atual (ponto atual dentro do segmenot)


  const { cp1x, cp1y, cp2x, cp2y } = controlPointsMap.get(currentSegment)
  const P0 = points[currentSegment]
  const P1 = { x: cp1x, y: cp1y }
  const P2 = { x: cp2x, y: cp2y }
  const P3 = points[currentSegment + 1]

  // bezier cubico
  // B(t) = ((1-t)^3 * P0) + (3 * (1-t)^2 * t * P1) + (3 * (1-t) * t^2 * P2) + t^3 * P3
  const x = ((1 - t) ** 3 * P0.x) + (3 * (1 - t) ** 2 * t * P1.x) + (3 * (1 - t) * t ** 2 * P2.x) + t ** 3 * P3.x
  const y = ((1 - t) ** 3 * P0.y) + (3 * (1 - t) ** 2 * t * P1.y) + (3 * (1 - t) * t ** 2 * P2.y) + t ** 3 * P3.y

  return { x, y }
}
